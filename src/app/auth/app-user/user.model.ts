export class User{
    constructor(
        // public categories:any,
        // public customerName:string,
        public id: string,
        public email:string,
        public fullName:string,
        private _token: string,
        public role:string,
        public gender:string,
        public roleId: number,
        public isDownload :boolean,
    ){ }

    get token(){
        // if(!this._tokenExpirationDate || new Date() > this._tokenExpirationDate){
        //     return null;
        // }
        return this._token;
    }
}
