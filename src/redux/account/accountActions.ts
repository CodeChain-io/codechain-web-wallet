import { U256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { PlatformAccount } from "../../model/address";
import { getPlatformAccount } from "../../networks/Api";
import { getAggsParcel } from "../../utils/parcel";
import chainActions from "../chain/chainActions";

export type Action = UpdateAvailableQuark | UpdateAccount | SetFetchingAccount;

export enum ActionType {
    UpdateAvailableQuark = 4000,
    UpdateAccount,
    SetFetchingAccount
}

export interface UpdateAvailableQuark {
    type: ActionType.UpdateAvailableQuark;
    data: {
        address: string;
        amount: U256;
    };
}

export interface UpdateAccount {
    type: ActionType.UpdateAccount;
    data: {
        address: string;
        account: PlatformAccount;
    };
}

const setFetchingAccount = (address: string): SetFetchingAccount => ({
    type: ActionType.SetFetchingAccount,
    data: {
        address
    }
});

const updateAccount = (
    address: string,
    account: PlatformAccount
): UpdateAccount => ({
    type: ActionType.UpdateAccount,
    data: {
        address,
        account
    }
});

const fetchAccountIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedAccount = getState().accountReducer.accounts[address];
        if (cachedAccount && cachedAccount.isFetching) {
            return;
        }
        if (
            cachedAccount &&
            cachedAccount.updatedAt &&
            +new Date() - cachedAccount.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch(setFetchingAccount(address));
            const networkId = getState().globalReducer.networkId;
            const accountResponse = await getPlatformAccount(
                address,
                networkId
            );
            dispatch(updateAccount(address, accountResponse));
            dispatch(calculateAvailableQuark(address));
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchAvailableQuark = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        dispatch(chainActions.fetchUnconfirmedParcelListIfNeed(address));
        dispatch(chainActions.fetchPendingParcelListIfNeed(address));
        dispatch(fetchAccountIfNeed(address));
    };
};

export interface SetFetchingAccount {
    type: ActionType.SetFetchingAccount;
    data: {
        address: string;
    };
}

const calculateAvailableQuark = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const unconfirmedParcelListObj = getState().chainReducer
            .unconfirmedParcelList[address];
        const accountObj = getState().accountReducer.accounts[address];
        const pendingParcelListObj = getState().chainReducer.pendingParcelList[
            address
        ];
        const unconfirmedParcelList =
            unconfirmedParcelListObj && unconfirmedParcelListObj.data;
        const account = accountObj && accountObj.data;
        const pendingParcelList =
            pendingParcelListObj && pendingParcelListObj.data;
        if (!unconfirmedParcelList || !account || !pendingParcelList) {
            return;
        }
        const aggrUnconfirmedParcel = getAggsParcel(
            address,
            unconfirmedParcelList
        );
        const unconfirmedParcelHashList = _.map(
            unconfirmedParcelList,
            parcel => parcel.hash
        );
        const validPendingParcelList = _.filter(
            pendingParcelList,
            pendingParcel =>
                !_.includes(
                    unconfirmedParcelHashList,
                    pendingParcel.parcel.hash
                )
        );
        const aggrPendingParcel = getAggsParcel(
            address,
            _.map(validPendingParcelList, p => p.parcel)
        );
        const availableQuark = account.balance.value
            .minus(aggrUnconfirmedParcel.output)
            .minus(aggrPendingParcel.input);

        dispatch({
            type: ActionType.UpdateAvailableQuark,
            data: {
                address,
                amount: new U256(availableQuark)
            }
        });
    };
};

export default {
    calculateAvailableQuark,
    fetchAccountIfNeed,
    fetchAvailableQuark
};
