export type IMessage = {
  cmd: "updateUserInfo";
  data: {
    name: string;
    passwd: string;
  };
};
