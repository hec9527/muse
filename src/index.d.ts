export type IMessage =
  | {
      cmd: "updateUserInfo";
      data: {
        name: string;
        passwd: string;
      };
    }
  | {
      cmd: "showInfo";
      data: string;
    };
