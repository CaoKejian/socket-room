import { PropType, defineComponent, onMounted, ref } from 'vue';
import axios from 'axios'

export const App = defineComponent({
  setup: (props, context) => {
    const socket = ref<WebSocket | null>(null)
    const messages = ref<{ text: string, _id: string }[]>([]) // 单独两人的数据组
    const newMessage = ref<string>('')
    const initInfo = async () => {
      const res = await axios.get('http://localhost:8080/api/info')
      messages.value = res.data
    }
    onMounted(() => {
      const ws = new WebSocket('ws://localhost:8080');
      initInfo()
      ws.onopen = () => {
        console.log('WebSocket 已连接');
        socket.value = ws;
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        messages.value.push(message);
      };
    });
    const sendMessage = () => {
      if (!socket.value || newMessage.value.trim() === '') return;

      const message: any = {
        text: newMessage.value.trim()
      };

      socket.value.send(JSON.stringify(message));
      messages.value.push(message)
      newMessage.value = '';
    }

    return () => (
      <div>
        <input type="text" v-model={newMessage.value} placeholder='用户1' />
        <button onClick={sendMessage}>submit</button>


        <ul>
          {messages.value.map(item => {
            return <li key={item._id}>{item.text}</li>
          })}
        </ul>
      </div>
    )
  }
})