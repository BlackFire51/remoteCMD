using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace RemoteConsole.Messages
{
    public class AuthAsw : BaseMsg
    {
        public new string Type = "AuthAsw";
        public int InstanceId;
    }
    public class Cmd : BaseMsg
    {
        public new string Type = "Cmd";
        public string cmd;
        public string[] args;
    }
}
