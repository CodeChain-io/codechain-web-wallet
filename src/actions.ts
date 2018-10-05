export type Action = ILogin & ILogout;

export interface ILogin {
    type: "Login";
}

export interface ILogout {
    type: "Logout";
}

const login = (): ILogin => ({
    type: "Login"
});

const logout = (): ILogout => ({
    type: "Logout"
});

export const Actions = {
    login,
    logout
};
