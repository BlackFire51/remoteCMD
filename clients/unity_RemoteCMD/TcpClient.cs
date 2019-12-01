using System;
using System.Net;
using System.Net.Sockets;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using System.Timers;

namespace RemoteConsole
{
    public class TcpClient
    {
        private Socket client;
        public bool canSend { get; private set; } = false;
        private byte[] revBuffer = null;
        private Queue<string> stack = new Queue<string>();
        private Queue<Messages.BaseMsg> stackDynamic = new Queue<Messages.BaseMsg>();
        private string appKey;
        private Timer timer;
        private localFunctions functions;

        public TcpClient(string host, int port,string appKey, localFunctions localFunc)
        {
            revBuffer = new byte[1024 * 1024]; // 1MB
            this.appKey = appKey;
            this.functions = localFunc;
            ConnectToServer(host,port);
        }
        //https://docs.microsoft.com/de-de/dotnet/framework/network-programming/asynchronous-client-socket-example
        private void ConnectToServer(string host,int port)
        {
            IPHostEntry ipHostInfo = Dns.GetHostEntry(host); // resolve url to IP
            IPAddress ipAddress = ipHostInfo.AddressList[0];
            IPEndPoint remoteEP = new IPEndPoint(ipAddress, port); 
            client = new Socket(ipAddress.AddressFamily, SocketType.Stream, ProtocolType.Tcp); // create sockect
            client.BeginConnect(remoteEP, new AsyncCallback(ConnectCallback), client); // connect socket to remote Host
        }
        private void ConnectCallback(IAsyncResult ar)
        {
            try{
                // Complete the connection.  
                client.EndConnect(ar);
                Debug.Log("Socket connected to {0}" + client.RemoteEndPoint.ToString());
                //########################
                // Hook msg log
                this.canSend = true;
                this.Send(JsonUtility.ToJson(new Messages.AuthReq(this.appKey)));
                Receive();
                timer = new Timer();
                timer.Interval = 1000;
                timer.Elapsed += Timer_Elapsed;
                timer.AutoReset = true;
                timer.Enabled = true;
            }
            catch (Exception e){
                Debug.LogError(e.ToString());
            }
        }
        public void Send(string data)
        {
            if (!this.canSend) return;
            // Convert the string data to byte data using ASCII encoding.  
            byte[] byteData = Encoding.UTF8.GetBytes(data);
            //Debug.Log("Send: "+data);
            // Begin sending the data to the remote device.  
            client.BeginSend(byteData, 0, byteData.Length, 0, new AsyncCallback(SendCallback), client);
        }
        private void SendCallback(IAsyncResult ar)
        {
            try{
                // Complete sending the data to the remote device.  
                int bytesSent = client.EndSend(ar);
                Console.WriteLine("Sent {0} bytes to server.", bytesSent);

            }catch (Exception e){
                Console.WriteLine(e.ToString());
            }
        }
        private void Receive()
        {
            try{
                // Begin receiving the data from the remote device.  
                client.BeginReceive(this.revBuffer, 0, this.revBuffer.Length, 0,
                    new AsyncCallback(ReceiveCallback), new StringBuilder());
            }catch (Exception e){
                Console.WriteLine(e.ToString());
            }
        }
        private void ReceiveCallback(IAsyncResult ar)
        {
            try{
                StringBuilder sb = (StringBuilder)ar.AsyncState;
                // Read data from the remote device.  
                int bytesRead = client.EndReceive(ar);
                
                    // There might be more data, so store the data received so far.  
                    sb.Append(Encoding.UTF8.GetString(revBuffer, 0, bytesRead));
                if (bytesRead == revBuffer.Length)
                {
                    //  Get the rest of the data.  
                    client.BeginReceive(this.revBuffer, 0, this.revBuffer.Length, 0,
                    new AsyncCallback(ReceiveCallback), sb);
                    return;
                }
                else{
                    // All the data has arrived; put it in response.  
                    Receive();
                    if (sb.Length > 1){
                        string msg = sb.ToString();
                        try
                        {
                            //dynamic msgJson = RemoteConsole.DynamicJson.Parse(msg);
                            Messages.BaseMsg msgJson = Messages.MessageHandler.getMessage(msg);
                            Debug.Log(msgJson);
                            switch (msgJson.Type) // check if we have a special purpos for msg this this prefix
                            {
                                case "AuthAsw":
                                    this.Send(this.functions.getListFroNetwork());
                                    break;
                                default: // no special porpos add to basic queue
                                    stackDynamic.Enqueue(msgJson);
                                    break;

                            }
                        }
                        catch (Exception e)
                        {
                            Debug.LogError("can not parse Json" + e);
                        }



                    }
                }
            }catch (Exception e){
                Console.WriteLine(e.ToString());
            }
        }
        public void Destroy()
        {
            timer.Enabled = false;
            timer.Dispose();
            client.Close();
            client.Dispose();
        }
        private void Timer_Elapsed(object sender, ElapsedEventArgs e)
        {
            this.Send("keepAlive");
        }

        public string getMessage()
        {
            if (stack.Count < 1) return null;
            return stack.Dequeue();
        }
        public bool dataAvalable()
        {
            return stack.Count > 1;
        }
        public Messages.BaseMsg getMessageDynamic()
        {
            if (stackDynamic.Count < 1) return null;
            return stackDynamic.Dequeue();
        }
        public bool dataAvalableDynamic()
        {
            return stackDynamic.Count > 1;
        }
        public int getQLen()
        {
            return stackDynamic.Count;
        }


    }


}

