Асинхронные операции
До сих пор мы работали с локальными данными, хранящимися в памяти вкладки браузера или локальном хранилище. На практике подавляющее большинство данных приложения хранится в базе данных на бэкенде и любые операции над ними выполняются при помощи HTTP-запросов.

Website client-server architecture
HTTP-запросы это асинхронные операции, которые представленные промисами, поэтому их можно разбить на три составляющие: процесс запроса (pending), успешное завершение запроса (fulfilled) и завершение запроса с ошибкой (rejected). Этот шаблон применим к любым запросам чтения, создания, удаления и обновления.

HTTP request pending, fulfilled and rejected states

Операции
Рассмотрим часто встречающуюся задачу загрузки данных, обработки индикатора загрузки и ошибки выполнения запроса. Объявим слайс списка задач, в состоянии которого будем хранить массив задач, флаг статуса загрузки и данные возможной ошибки.

src/redux/tasksSlice.js
const tasksSlice = {
  name: "tasks",
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
};

Добавим редюсер для обработки каждого из возможных состояний запроса.

src/redux/tasksSlice.js
const tasksSlice = {
  name: "tasks",
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    // Выполнится в момент старта HTTP-запроса
    fetchingInProgress(state) {},
    // Выполнится если HTTP-запрос завершился успешно
    fetchingSuccess() {},
    // Выполнится если HTTP-запрос завершился с ошибкой
    fetchingError() {},
  },
};

В редюсерах изменяем соответствующие части состояния. Флаг загрузки isLoading устанавливаем в true на старте запроса, и false в любом другом случае, потому что запрос завершен. При выполнении запроса с ошибкой, изменяем значение свойства error, записав в него то, что придет в action.payload - информация об ошибке. В случае успешного выполнения запроса, сбрасываем значение ошибки и записываем в items полученные данные из action.payload - массив задач.

src/redux/tasksSlice.js
const tasksSlice = {
  name: "tasks",
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    fetchingInProgress(state) {
      state.isLoading = true;
    },
    fetchingSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.items = action.payload;
    },
    fetchingError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
};
export const { fetchingInProgress, fetchingSuccess, fetchingError } =
  tasksSlice.actions;

Для того чтобы при отправке экшена выполнить асинхронный код, необходимо объявить «операцию» - асинхронный генератор экшена, в теле которого вызываются другие, синхронные генераторы экшенов. Операция не возвращает экшен, вместо этого она возвращает другую функцию, которая аргументом принимает уже знакомый нам dispatch. В теле этой функции можно выполнять асинхронные действия, например HTTP-запрос. Для запросов используем библиотеку axios.

src/redux/operations.js
import axios from "axios";
axios.defaults.baseURL = "https://62584f320c918296a49543e7.mockapi.io";
const fetchTasks = () => async dispatch => {
  try {
    const response = await axios.get("/tasks");
  } catch (e) {}
};

REDUX THUNK
Возможность объявлять асинхронные генераторы экшенов и выполнять асинхронные действия предоставляет расширение стора redux-thunk, которое по умолчанию включено в Redux Toolkit.

Теперь внутри операции отправляем синхронные экшены для обработки трех ситуаций: установка индикатора загрузки, получение данных при успешном запросе и обработка ошибки.

src/redux/operations.js
import axios from "axios";
import {
  fetchingInProgress,
  fetchingSuccess,
  fetchingError,
} from "./tasksSlice";
axios.defaults.baseURL = "https://62584f320c918296a49543e7.mockapi.io";
export const fetchTasks = () => async dispatch => {
  try {
    // Индикатор загрузки
    dispatch(fetchingInProgress());
    // HTTP-запрос
    const response = await axios.get("/tasks");
    // Обработка данных
    dispatch(fetchingSuccess(response.data));
  } catch (e) {
    // Обработка ошибки
    dispatch(fetchingError(e.message));
  }
};

Далее добавим минимальный код вызова асинхронного генератора экшена в компоненте, рендер индикатора загрузки, данных и обработку ошибки.

src/components/App.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "redux/operations";
import { getTasks } from "redux/selectors";
export const App = () => {
  const dispatch = useDispatch();
  // Получаем части состояния
  const { items, isLoading, error } = useSelector(getTasks);
  // Вызываем операцию
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);
  // Рендерим разметку в зависимости от значений в состоянии
  return (
    <div>
      {isLoading && <p>Loading tasks...</p>}
      {error && <p>{error}</p>}
      <p>{items.length > 0 && JSON.stringify(items, null, 2)}</p>
    </div>
  );
};

Разберите код живого примера. При монтировании компонента App сначала отображается индикатор загрузки, а через какое-то время массив задач. Для того чтобы обновить страницу примера в песочнице, нажмите кнопку обновления в нижней части его окна.


ИМИТАЦИЯ ОШИБКИ ЗАПРОСА
Для того чтобы создать ситуацию с ошибкой, измените адрес бэкенда на не валидный, добавив к нему одну любую букву или цифру, и обновите пример. В таком случае сначала отобразится индикатор загрузки, а через какое-то время сообщение об ошибке.

createAsyncThunk
Redux Toolkit упрощает процесс объявления асинхронного генератора экшена при помощи функции createAsyncThunk(). Первым аргументом она принимает тип экшена, а вторым функцию которая должна выполнить HTTP-запрос и вернуть промис с данными, которые станут значением payload. Она возвращает асинхронный генератор экшена (операцию), при запуске которого выполнится функция с кодом запроса.

src/redux/operations.js
import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
axios.defaults.baseURL = "https://62584f320c918296a49543e7.mockapi.io";
export const fetchTasks = createAsyncThunk("tasks/fetchAll", async () => {
  const response = await axios.get("/tasks");
  return response.data;
});

Функция createAsyncThunk() автоматически создает экшены представляющие жизненный цикл HTTP-запроса, и отправляет их в правильном порядке, в зависимости от статуса запроса. Тип созданных экшенов состоит из строки указанной первым аргументом ("tasks/fetchAll"), к которой добавляется постфиксы "pending", "fulfilled" или "rejected", в зависимости от того, какое состояния запроса описывает экшен.

"tasks/fetchAll/pending" - начало запроса
"tasks/fetchAll/fulfilled" - успешное завершение запроса
"tasks/fetchAll/rejected" - завершение запроса с ошибкой
Заменив в нашем примере код объявления операции fetchTasks и перезагрузив страницу, в инструментах разработчика видно как при монтировании компонента App отправляются экшены с правильными типами и payload.

Redux DevTools with dispatched thunk actions
Функция createAsyncThunk не создает редюсер, так как не может знать как мы хотим отслеживать состояние загрузки, с какими данными завершится запрос и как их правильно обработать. Поэтому следующим шагом будет изменение кода слайса tasksSlice так, чтобы он обрабатывал новые экшены.

src/redux/tasksSlice.js
import { createSlice } from "@reduxjs/toolkit";
// Импортируем операцию
import { fetchTasks } from "./operations";
const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  // Добавляем обработку внешних экшенов
  extraReducers: {
    [fetchTasks.pending](state, action) {},
    [fetchTasks.fulfilled](state, action) {},
    [fetchTasks.rejected](state, action) {},
  },
});
export const tasksReducer = tasksSlice.reducer;

Свойство extraReducers используется чтобы объявить редюсеры для «внешних» типов экшенов, то есть тех которые не сгенерированы из свойства reducers. Поскольку эти редюсеры обрабатывают «внешние» экшены, для них не будут созданы генераторы экшенов в slice.actions, в этом нет необходимости.

ЭКШЕНЫ ОПЕРАЦИИ
Генераторы экшенов, представляющие жизненный цикл запроса, хранятся в объекте операции как свойства pending, fulfilled и rejected. Они автоматически создаются при помощи createAction и поэтому имеют свойство type и переопределенный метод toString(), возвращающий строку типа экшена.

Свойство reducers нам больше не нужно, поэтому всю логику обработки экшенов запроса переносим в новые редюсеры.

src/redux/tasksSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchTasks } from "./operations";
const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  extraReducers: {
    [fetchTasks.pending](state) {
      state.isLoading = true;
    },
    [fetchTasks.fulfilled](state, action) {
      state.isLoading = false;
      state.error = null;
      state.items = action.payload;
    },
    [fetchTasks.rejected](state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});
export const tasksReducer = tasksSlice.reducer;

Осталось добавить обработку запроса завершившегося с ошибкой. Для этого необходимо дополнить код создания операции fetchTasks так, чтобы в случае ошибки запроса возвращался промис, который будет отклонен. Тогда на экшене ошибки запроса появится свойство payload.

src/redux/operations.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
axios.defaults.baseURL = "https://62584f320c918296a49543e7.mockapi.io";
export const fetchTasks = createAsyncThunk(
  "tasks/fetchAll",
  // Используем символ подчеркивания как имя первого параметра,
  // потому что в этой операции он нам не нужен
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("/tasks");
      // При успешном запросе возвращаем промис с данными
      return response.data;
    } catch (e) {
      // При ошибке запроса возвращаем промис
      // который будет отклонен с текстом ошибки
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

Колбэк функция, в которой выполняется запрос, называется payloadCreator и отвечает за составление значения свойства payload. Она будет вызвана с двумя аргументами: arg и thunkAPI.

payloadCreator(arg, thunkAPI)

arg - значение, которое было передано операции при вызове. Используется, например, для передачи идентификаторов объектов при удаления, текста заметки при создании и т. п.
thunkAPI - объект, который передается в асинхронный генератор экшена в redux-thunk. Содержит свойства и методы доступа к стору, отправки экшенов, а также некоторые дополнительные.
Разберите код живого примера, в котором используется весь пройденный материал.

Планировщик задач
Изменим код нашего приложения так, чтобы работать с данными от бэкенда. Для этого используем сервис mockapi.io, который предоставляет визуальный интерфейс для создания простого бэкенда с базой данных. Это позволит нам выполнять CRUD операции с массивом объектов.

В песочнице вы можете взять стартовый код приложения планировщика задач с уже готовыми компонентами React и базовой логикой Redux, дополняя его параллельно изучению материала.


Селекторы
Из-за того что у нас изменилась форма состояния, необходимо дополнить файл селекторов.

src/redux/selectors.js
export const getTasks = state => state.tasks.items;
export const getIsLoading = state => state.tasks.isLoading;
export const getError = state => state.tasks.error;
export const getStatusFilter = state => state.filters.status;

Чтение задач
Операция и редюсеры для чтения массива задач у нас уже есть. Дополним компонент App так, чтобы при его монтировании запускалась операция запроса за списком задач.

src/components/App.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchTasks } from "redux/operations";
// Импорты компонентов
export const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);
  return (
    <Layout>
      <AppBar />
      <TaskForm />
      <TaskList />
    </Layout>
  );
};

После монтирования компонента App и завершения запроса, в интерфейсе отобразится список задач - компонент TaskList, который использует селекторы для получения массива задач из состояния Redux.

Индикатор запроса
Добавим отображение индикатора запроса над списком задач.

src/components/App.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "redux/operations";
import { getError, getIsLoading } from "redux/selectors";
// Импорты компонентов
export const App = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(getIsLoading);
  const error = useSelector(getError);
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);
  return (
    <Layout>
      <AppBar />
      <TaskForm />
      {isLoading && !error && <b>Request in progress...</b>}
      <TaskList />
    </Layout>
  );
};

Добавление задачи
Объявим операцию добавления задачи, которая ожидает только текст введенный пользователем. За создание уникального идентификатора и добавление свойства completed теперь будет отвечать бэкенд.

src/redux/operations.js
export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (text, thunkAPI) => {
    try {
      const response = await axios.post("/tasks", { text });
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

В компоненте TaskForm добавляем код запуска операции добавления задачи при сабмите формы.

src/components/TaskForm/TaskForm.js
import { useDispatch } from "react-redux";
import { addTask } from "redux/operations";
export const TaskForm = () => {
  const dispatch = useDispatch();
  const handleSubmit = event => {
    event.preventDefault();
    const form = event.target;
    dispatch(addTask(event.target.elements.text.value));
    form.reset();
  };
  // Остальное код компонента
};

Добавим в слайс tasksSlice код обработки экшенов добавления задачи.

src/redux/tasksSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchTasks, addTask } from "./operations";
const tasksSlice = createSlice({
  extraReducers: {
    // Код остальных редюсеров
    [addTask.pending](state) {
      state.isLoading = true;
    },
    [addTask.fulfilled](state, action) {
      state.isLoading = false;
      state.error = null;
      state.items.push(action.payload);
    },
    [addTask.rejected](state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

Удаление задачи
Объявим операцию удаления, которая ожидает только идентификатор удаляемой задачи.

src/redux/operations.js
export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId, thunkAPI) => {
    try {
      const response = await axios.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

В компоненте Task добавляем код запуска операции удаления задачи при клике по кнопке удаления, и передаем ей идентификатор.

src/components/Task/Task.js
import { useDispatch } from "react-redux";
import { MdClose } from "react-icons/md";
import { deleteTask } from "redux/operations";
export const Task = ({ task }) => {
  const dispatch = useDispatch();
  const handleDelete = () => dispatch(deleteTask(task.id));
  return (
    <div>
      <input type="checkbox" checked={task.completed} />
      <p>{task.text}</p>
      <button onClick={handleDelete}>
        <MdClose size={24} />
      </button>
    </div>
  );
};

Добавим в слайс tasksSlice код обработки экшенов удаления задачи.

src/redux/tasksSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchTasks, addTask, deleteTask } from "./operations";
const tasksSlice = createSlice({
  // Код остальных редюсеров
  extraReducers: {
    [deleteTask.pending](state) {
      state.isLoading = true;
    },
    [deleteTask.fulfilled](state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.items.findIndex(
        task => task.id === action.payload.id
      );
      state.items.splice(index, 1);
    },
    [deleteTask.rejected](state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});
export const tasksReducer = tasksSlice.reducer;

Переключение статуса задачи
Объявим операцию изменения статуса, которая ожидает весь объект задачи.

src/redux/operations.js
export const toggleCompleted = createAsyncThunk(
  "tasks/toggleCompleted",
  async (task, thunkAPI) => {
    try {
      const response = await axios.put(`/tasks/${task.id}`, {
        completed: !task.completed,
      });
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

В компоненте Task добавляем код запуска операции изменения статуса при клике по чекбоксу, и передаем ей весь объект задачи.

src/components/TaskForm/TaskForm.js
import { useDispatch } from "react-redux";
import { MdClose } from "react-icons/md";
import { deleteTask, toggleCompleted } from "redux/operations";
export const Task = ({ task }) => {
  const dispatch = useDispatch();
  const handleDelete = () => dispatch(deleteTask(task.id));
  const handleToggle = () => dispatch(toggleCompleted(task));
  return (
    <div>
      <input type="checkbox" checked={task.completed} onChange={handleToggle} />
      <p>{task.text}</p>
      <button onClick={handleDelete}>
        <MdClose size={24} />
      </button>
    </div>
  );
};

Добавим в слайс tasksSlice код обработки экшенов изменения статуса задачи.

src/redux/tasksSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchTasks, addTask, deleteTask, toggleCompleted } from "./operations";
const tasksSlice = createSlice({
  extraReducers: {
    // Код остальных редюсеров
    [toggleCompleted.pending](state) {
      state.isLoading = true;
    },
    [toggleCompleted.fulfilled](state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.items.findIndex(
        task => task.id === action.payload.id
      );
      state.items.splice(index, 1, action.payload);
    },
    [toggleCompleted.rejected](state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});
export const tasksReducer = tasksSlice.reducer;

Сокращаем код редюсеров
Вы наверное уже обратили внимание на то, что код редюсеров, обрабатывающих pending и rejected экшены всех операций, идентичен. Вынесем логику этих редюсеров в функции, что поможет нам сократить дублирование кода.

src/redux/tasksSlice.js
const handlePending = state => {
  state.isLoading = true;
};
const handleRejected = (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
};
const tasksSlice = createSlice({
  extraReducers: {
    [fetchTasks.pending]: handlePending,
    [addTask.pending]: handlePending,
    [deleteTask.pending]: handlePending,
    [toggleCompleted.pending]: handlePending,
    [fetchTasks.rejected]: handleRejected,
    [addTask.rejected]: handleRejected,
    [deleteTask.rejected]: handleRejected,
    [toggleCompleted.rejected]: handleRejected,
    [fetchTasks.fulfilled](state, action) {
      state.isLoading = false;
      state.error = null;
      state.items = action.payload;
    },
    [addTask.fulfilled](state, action) {
      state.isLoading = false;
      state.error = null;
      state.items.push(action.payload);
    },
    [deleteTask.fulfilled](state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.items.findIndex(task => task.id === action.payload);
      state.items.splice(index, 1);
    },
    [toggleCompleted.fulfilled](state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.items.findIndex(
        task => task.id === action.payload.id
      );
      state.items.splice(index, 1, action.payload);
    },
  },
});
export const tasksReducer = tasksSlice.reducer;

Финальный код
Разберите код живого примера, в котором используется весь пройденный материал.

