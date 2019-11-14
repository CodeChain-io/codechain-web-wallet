import { U64 } from "codechain-sdk/lib/core/classes";
import _ from "lodash";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { PlatformAccount } from "../../model/address";
import { getPlatformAccount } from "../../networks/Api";
import { TxUtil } from "../../utils/transaction";
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
        amount: U64;
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
    return (dispatch: ThunkDispatch<ReducerConfigure, void, Action>) => {
        dispatch(chainActions.fetchPendingTxListIfNeed(address));
        dispatch(chainActions.fetchTxListIfNeed(address));
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
        const txListObj = getState().chainReducer.txList[address];
        const accountObj = getState().accountReducer.accounts[address];
        const pendingTxListObj = getState().chainReducer.pendingTxList[address];
        const txList = txListObj && txListObj.data;
        const account = accountObj && accountObj.data;
        const pendingTxList = pendingTxListObj && pendingTxListObj.data;
        if (!txList || !account || !pendingTxList) {
            return;
        }

        const txHashList = _.map(txList, tx => tx.hash);
        const validPendingTxList = _.filter(
            pendingTxList,
            pendingTx => !_.includes(txHashList, pendingTx.hash)
        );
        const aggrPendingQuark = TxUtil.getAggsQuark(
            address,
            validPendingTxList
        );
        const availableQuark = U64.minus(
            account.balance,
            aggrPendingQuark.input
        );
        dispatch({
            type: ActionType.UpdateAvailableQuark,
            data: {
                address,
                amount: availableQuark
            }
        });
    };
};

export default {
    calculateAvailableQuark,
    fetchAccountIfNeed,
    fetchAvailableQuark
};
