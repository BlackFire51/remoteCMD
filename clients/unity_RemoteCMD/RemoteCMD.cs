using System;
using UnityEngine;
using RemoteConsole;


public class RemoteCMD : MonoBehaviour
{
    private TcpClient client=null; // special TcpClient wapper for async unity usage
    public string host = "localhost"; // Host: to be displayed in Editor
    public int port = 1234;// Port: to be displayed in Editor
    public string appKey = "";
    private static localFunctions FUNCTIONS = new localFunctions();

    // Start is called before the first frame update
    void Start()
    {
        //RemoteCMD.registerComand("test1", "this is a test", "testing Stuff", (string[] args) =>
        //  {
        //      Debug.Log("Exec test 1 ");
        //  });
        client = new TcpClient(host, port,appKey, FUNCTIONS);
    }

    // Update is called once per frame
    void Update()
    {
        if (!client.dataAvalable()) return; // check if we have data avalable 
        string str = client.getMessage(); // Message resived from Network 
        if (str == null) return; // invalide msg skipping
        HandleNetworkMessage(str);
    }
    void OnEnable()
    {
        // Hook into log Messages
        Application.logMessageReceived += HandleLog;
    }

    void OnDisable()
    {
        Application.logMessageReceived -= HandleLog;
    }
    void OnApplicationQuit()
    {
        client.Destroy(); 
    }

    /// <summary>
    /// Internal function to handle log mesages
    /// </summary>
    /// <param name="logString">what is "printed" in the log</param>
    /// <param name="stackTrace">witch module is calling the function</param>
    /// <param name="type">type of log Entry (info,debug,error,...)</param>
    void HandleLog(string logString, string stackTrace, LogType type)
    {
        string msg = JsonUtility.ToJson(new logMessage(logString, Enum.GetName(typeof(LogType), type)));
        client.Send(msg);
    }
    /// <summary>
    /// Internal function to handle Msg from the Network 
    /// need to be here beacuase of threading in Unity 
    /// </summary>
    /// <param name="msg">Message String</param>
    void HandleNetworkMessage(string msg)
    {
        FUNCTIONS.HandleFromNetwork(msg.Trim());
    }
    /// <summary>
    /// add a cutom function for the remote comandline
    /// </summary>
    /// <param name="name">Name of the comand</param>
    /// <param name="usage">example usage </param>
    /// <param name="help">hext to be displayed by the Help command</param>
    /// <param name="callback">function to be called on execution with string array as parameter</param>
    public static void registerComand(string name, string usage, string help, delegateCallback callback)
    {
        FUNCTIONS.registerComand(name, usage, help, callback);
    }

    private class logMessage
    {
        public string Type = "Log";
        public string LogMsg;
        public string LogType;
        public logMessage(string msg,string logType)
        {
            LogMsg = msg;
            LogType = logType;
        }

    }

}