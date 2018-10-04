export type Action = ILogin;

export interface ILogin {
    type: "Login";
}

const login = (): ILogin => ({
    type: "Login"
});

export const Actions = {
    login
};
