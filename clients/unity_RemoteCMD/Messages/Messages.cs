using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace RemoteConsole.Messages
{
    public class BaseMsg
    {
        public string Type;
        public System.Type GetMsgType()
        {
            switch (this.Type)
            {
                case "AuthAsw":
                    return typeof(AuthAsw);
                case "Cmd":
                    return typeof(Cmd);

            }
            return typeof(BaseMsg);
        }
    }

    public class MessageHandler
    {
        static public BaseMsg getMessage(string Json)
        {
            BaseMsg msgJson = JsonUtility.FromJson<BaseMsg>(Json);
            return (BaseMsg)JsonUtility.FromJson(Json,msgJson.GetMsgType());
        }
    }
}
