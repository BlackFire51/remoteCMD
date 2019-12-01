using System.Collections;
using System.Collections.Generic;

namespace RemoteConsole.Messages
{
    public class AuthReq : BaseMsg
    {
        public new string Type = "AuthReq";
        public string appKey;
        public AuthReq(string appKey)
        {
            this.appKey = appKey;
        }

    }
    public class Log : BaseMsg
    {
        public new string Type = "Log";
        public string LogMsg;
        public string LogType;
        public Log(string msg, string logType)
        {
            LogMsg = msg;
            LogType = logType;
        }

    }

}