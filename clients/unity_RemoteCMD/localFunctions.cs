using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
namespace RemoteConsole
{
    public delegate void delegateCallback(string[] args);
    public class localFunctions
    {
        private Dictionary<string,localFunctionContainer> functions= new Dictionary<string, localFunctionContainer>();
        /// <summary>
        /// Register a ftion fpr the remote Console
        /// </summary>
        /// <param name="name"></param>
        /// <param name="usage"></param>
        /// <param name="help"></param>
        /// <param name="callback"></param>
        public void registerComand(string name, string usage, string help, delegateCallback callback )
        {
            functions.Add(name, new localFunctionContainer(name, usage, help, callback));
        }
        /// <summary>
        /// Execute funktion witch have been called over the network
        /// </summary>
        /// <param name="msg">console input String</param>
        public void HandleFromNetwork(string msg)
        {
            if(!msg.Contains(" ")) // we have no space so no args
            {
                if (functions.ContainsKey(msg)) // check if we have a comand with the name
                {
                    functions[msg].Callback(new string[0]); // exec cmd with empty params
                }
                return;
            }
            string[] arr = msg.Split(' ');
            if (!functions.ContainsKey(arr[0])) return; // we dont have a comand with this name 
            string[] args = new string[arr.Length - 1];
            for(int i = 0; i < args.Length; i++)
            {
                args[i] = arr[i + 1]; // remove first entry from array
            }
            functions[msg].Callback(args); // exec cmd
        }
     
        public void HandleNetworkMessageJson(Messages.BaseMsg msg)
        {
            if (msg.Type != "Cmd") return; // this is not a command msg 
            Messages.Cmd cmd = (Messages.Cmd)msg;
            if (!functions.ContainsKey(cmd.cmd)) return; // we dont have a comand with this name 
            functions[cmd.cmd].Callback(cmd.args); // exec cmd
        }

        public string getListFroNetwork()
        {
            localFunctionInfo[] infoArr = new localFunctionInfo[this.functions.Count];
            int i = 0;
            foreach (string key in this.functions.Keys)
            {
                infoArr[i++] = new localFunctionInfo(this.functions[key]);
            }
            string str = JsonHelper.ToJson("cmdFunctionList",infoArr, true);
            return str;
        }
    }

    /// <summary>
    /// Class to Hold data of a function
    /// </summary>
    class localFunctionContainer
    {
        public delegateCallback Callback;
        public string Name;
        public string Usage;
        public string Help;
        public localFunctionContainer(string name, string desc, string help, delegateCallback callback)
        {
            this.Name = name;
            this.Usage = desc;
            this.Help = help;
            this.Callback = callback;
        }
    }
    [Serializable]
    class localFunctionInfo
    {
        public string Name;
        public string Usage;
        public string Help;
        public localFunctionInfo(string name, string usage, string help)
        {
            this.Name = name;
            this.Usage = usage;
            this.Help = help;
        }
        public localFunctionInfo(localFunctionContainer container)
        {
            this.Name = container.Name;
            this.Usage = container.Usage;
            this.Help = container.Help;
        }
    }
    public static class JsonHelper
    {
        public static T[] FromJson<T>(string json)
        {
            Wrapper<T> wrapper = JsonUtility.FromJson<Wrapper<T>>(json);
            return wrapper.Items;
        }
        public static string ToJson<T>(string msgType,T[] array, bool prettyPrint=false)
        {
            Wrapper<T> wrapper = new Wrapper<T>();
            wrapper.Items = array;
            wrapper.Type = msgType;
            return JsonUtility.ToJson(wrapper, prettyPrint);
        }

        [Serializable]
        private class Wrapper<T>
        {
            public string Type;
            public T[] Items;
        }
    }
}