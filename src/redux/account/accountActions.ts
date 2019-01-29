import BigNumber from "bignumber.js";
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
    UpdateAvailableQuark = "UpdateAvailableQuark",
    UpdateAccount = "UpdateAccount",
    SetFetchingAccount = "SetFetchingAccount"
}

export interface UpdateAvailableQuark {
    type: ActionType.UpdateAvailableQuark;
    data: {
        address: string;
        amount: string;
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
            // FIXME: Currently, React-chrome-redux saves data to the background script asynchronously.
            // This code is temporary for solving this problem.
            setTimeout(() => {
                dispatch(calculateAvailableQuark(address));
            }, 300);
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchAvailableQuark = (address: string) => {
    return (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        dispatch(chainActions.fetchParcelListIfNeed(address));
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
    return (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const parcelListObj = getState().chainReducer.parcelList[address];
        const accountObj = getState().accountReducer.accounts[address];
        const pendingParcelListObj = getState().chainReducer.pendingParcelList[
            address
        ];
        const parcelList = parcelListObj && parcelListObj.data;
        const account = accountObj && accountObj.data;
        const pendingParcelList =
            pendingParcelListObj && pendingParcelListObj.data;
        if (!parcelList || !account || !pendingParcelList) {
            return;
        }

        const parcelHashList = _.map(parcelList, parcel => parcel.hash);
        const validPendingParcelList = _.filter(
            pendingParcelList,
            pendingParcel =>
                !_.includes(parcelHashList, pendingParcel.parcel.hash)
        );
        const aggrPendingParcel = getAggsParcel(
            address,
            _.map(validPendingParcelList, p => p.parcel)
        );
        const availableQuark = new BigNumber(account.balance).minus(
            aggrPendingParcel.input
        );
        dispatch({
            type: ActionType.UpdateAvailableQuark,
            data: {
                address,
                amount: availableQuark.toString(10)
            }
        });
    };
};

export default {
    calculateAvailableQuark,
    fetchAccountIfNeed,
    fetchAvailableQuark
};
