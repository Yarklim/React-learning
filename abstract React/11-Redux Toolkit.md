Redux Toolkit
При использовании библиотеки Redux есть три основные проблемы:

Излишне сложный процесс настройки стора
Необходимость установки стандартного набора дополнительных библиотек для расширения возможностей Redux
Большой объем шаблонного кода создания экшенов, редюсеров и т. п.
Redux Toolkit - это официальная библиотека для эффективной разработки с использованием Redux, которая предназначена для стандартизации и упрощения написания логики Redux.

Позволяет сосредоточиться на написании основной логики приложения, не тратя время на настройку.
Включает в себя утилиты для упрощения основных задач. Таких как настройка стора, создание экшенов и редюсеров, иммутабельное обновление данных и многое другое.
Предоставляет стандартный набор настроек для стора и включает в себя наиболее часто используемые библиотеки из экосистемы Redux.
Библиотека не предназначена для решения всех возможных проблем и намеренно ограничена в объеме. Такие решения как HTTP-запросы, структура папок и файлов, управление связями сущностей в сторе и т. д. ложатся на плечи разработчика. Тем не менее, Redux Toolkit будет полезен для всех стандартных задач, поможет упростить и улучшить код связанный с Redux.

Установка
Redux Toolkit устанавливается как стандартный NPM пакет.

npm install @reduxjs/toolkit

Используя Redux Toolkit нет необходимости добавлять в проект пакет redux, кроме случаев когда вам необходима функция combineReducers(). Достаточно установить @reduxjs/toolkit для написания логики Redux и react-redux для связи стора с компонентами.

npm install @reduxjs/toolkit react-redux

Если вы инициализируете создание стартовых файлов приложения используя Create React App, без заранее заготовленного шаблона проекта, как например для домашних работ, в таком случае стоит использовать официальный шаблон. Для этого команде npx create-react-app нужно передать флаг --template со значением redux.

npx create-react-app my-app --template redux

configureStore
Redux Toolkit предоставляет функцию configureStore(options), которая оборачивает оригинальный createStore(), единственным аргументом ожидает объект параметров и настраивает некоторые полезные инструменты разработки как часть процесса создания стора.

Будем выполнять рефакторинг кода приложения планировщика задач из предыдущего занятия.

src/redux/store.js
//=============== Before ========================
import { createStore } from "redux";
import { devToolsEnhancer } from "@redux-devtools/extension";
import { rootReducer } from "./reducer";
const enhancer = devToolsEnhancer();
export const store = createStore(rootReducer, enhancer);
//=============== After ========================
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducer";
const store = configureStore({
  reducer: rootReducer,
});

На первый взгляд практически одно и тоже, тем не менее, сразу были настроены инструменты разработчика (Redux DevTools) и некоторые другие полезные функции, например проверка распространенных ошибок, таких как мутация состояния в редюсерах или использование невалидных значений в состоянии.

Также функция configureStore() может автоматически создать корневой редюсер. Для этого необходимо передать свойству reducer объект той же формы что в combineReducers. Для начала удалим создание корневого редюсера в коде нашего приложения и добавим импорты редюсеров задач и фильтров из файла src/redux/reducer.js. Опустим не критичный исходный код для того чтобы сократить объем примеров.

src/redux/reducer.js
//=============== Before ========================
import { combineReducers } from "redux";
import { statusFilters } from "./constants";
const tasksInitialState = [];
const tasksReducer = (state = tasksInitialState, action) => {
  // Reducer code
};
const filtersInitialState = {
  status: statusFilters.all,
};
const filtersReducer = (state = filtersInitialState, action) => {
  // Reducer code
};
export const rootReducer = combineReducers({
  tasks: tasksReducer,
  filters: filtersReducer,
});
//=============== After ========================
import { statusFilters } from "./constants";
const tasksInitialState = [];
export const tasksReducer = (state = tasksInitialState, action) => {
  // Reducer code
};
const filtersInitialState = {
  status: statusFilters.all,
};
export const filtersReducer = (state = filtersInitialState, action) => {
  // Reducer code
};

Теперь в файле создания стора импортируем и используем отдельные редюсеры.

src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { tasksReducer, filtersReducer } from "./reducer";
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    filters: filtersReducer,
  },
});

Разберите живой пример планировщика задач с обновленным кодом создания стора.

createAction
Функция createAction(type) упрощает процесс объявления экшенов. В качестве аргумента она принимает строку описывающую тип действия и возвращает генератор экшена.

src/redux/actions.js
//=============== Before ========================
const addTask = text => {
  return { type: "tasks/AddTask", payload: text };
};
console.log(addTask("Learn Redux Toolkit"));
// {type: "tasks/addTask", payload: "Learn Redux Toolkit"}
//=============== After ========================
import { createAction } from "@reduxjs/toolkit";
const addTask = createAction("tasks/AddTask");
console.log(addTask("Learn Redux Toolkit"));
// {type: "tasks/addTask", payload: "Learn Redux Toolkit"}

Добавим код создания остальных генераторов экшенов для нашего приложения. Использование createAction() избавит нас от повторяющегося шаблонного кода объявления генератора экшена.

src/redux/actions.js
import { createAction } from "@reduxjs/toolkit";
export const addTask = createAction("tasks/addTask");
export const deleteTask = createAction("tasks/deleteTask");
export const toggleCompleted = createAction("tasks/toggleCompleted");
export const setStatusFilter = createAction("filters/setStatusFilter");

Тип экшена
Есть два способа получить тип экшена, например для использования в редюсере.

import { createAction } from "@reduxjs/toolkit";

const addTask = createAction("tasks/AddTask");

// У генератора экшена есть свойство type
console.log(addTask.type); // "tasks/AddTask"

// Метод toString() функции addTask был переопределен
console.log(addTask.toString()); // "tasks/AddTask"

В редюсере импортируем экшены и используем их свойство type для замены строк внутри инструкции switch.

src/redux/reducer.js
import { addTask, deleteTask, toggleCompleted } from "./actions";
export const tasksReducer = (state = tasksInitialState, action) => {
  switch (action.type) {
    case addTask.type:
      return [...state, action.payload];
    case deleteTask.type:
      return state.filter(task => task.id !== action.payload);
    case toggleCompleted.type:
      return state.map(task => {
        if (task.id !== action.payload) {
          return task;
        }
        return { ...task, completed: !task.completed };
      });
    default:
      return state;
  }
};

Содержимое payload
По умолчанию генераторы экшенов принимают один аргумент, который становится значением свойства payload. Если нужно написать дополнительную логику создания значения payload, например добавить уникальный идентификатор, createAction можно передать второй, необязательный аргумент - функцию создания экшена.

createAction(type, prepareAction)

Аргументы генератора экшена будут переданы функции prepareAction, которая должна вернуть объект со свойством payload. Свойство type будет добавлено автоматически.

src/redux/actions.js
import { createAction, nanoid } from "@reduxjs/toolkit";
export const addTask = createAction("tasks/addTask", text => {
  return {
    payload: {
      text,
      id: nanoid(),
      completed: false,
    },
  };
});
console.log(addTask("Learn Redux Toolkit"));
/**
 * {
 *   type: 'tasks/addTask',
 *   payload: {
 *     text: 'Learn Redux Toolkit',
 *     id: '4AJvwMSWEHCchcWYga3dj',
 *     completed: false
 *   }
 * }
 **/

Разберите живой пример планировщика задач с обновленным кодом создания стора и генераторов экшенов.

createReducer
Любой редюсер получает состояния Redux и экшен, проверяет тип экшена внутри инструкции switch и выполняет соответствующую логику обновления состояния для данного экшена. К тому же, редюсер определяет начальное значение состояния и возвращает полученное состояние, если он не должен обрабатывать экшен. Этот способ требует слишком много шаблонного кода и подвержен ошибкам. Функция createReducer() упрощает процесс объявления редюсеров.

createReducer(initialState, actionsMap)

Первым аргументом она ожидает начальное состояние редюсера, а вторым объект свойств специального формата, где каждый ключ это тип экшена, а значение - это функция-редюсер для этого типа. То есть каждый case становится ключом объекта, для которого пишется свой мини-редюсер.

Заменим код объявления редюсера задач в нашем приложении используя createReducer.

src/redux/reducer.js
import { createReducer } from "@reduxjs/toolkit";
import { statusFilters } from "./constants";
import { addTask, deleteTask, toggleCompleted } from "./actions";
const tasksInitialState = [];
//=============== Before ========================
const tasksReducer = (state = tasksInitialState, action) => {
  switch (action.type) {
    case addTask.type:
    // case logic
    case deleteTask.type:
    // case logic
    case toggleCompleted.type:
    // case logic
    default:
      return state;
  }
};
//=============== After ========================
export const tasksReducer = createReducer(tasksInitialState, {
  [addTask]: (state, action) => {},
  [deleteTask]: (state, action) => {},
  [toggleCompleted]: (state, action) => {},
});

Обратите внимание на то, что не нужен код для блока default. Функция createReducer автоматически добавляет редюсеру обработку поведения по умолчанию.

ПРИВЕДЕНИЕ К СТРОКЕ
Синтаксис вычисляемых свойств объекта приводит значение к строке, поэтому можно просто использовать имя функции без указания свойства type, ведь метод toString() генератора экшена был переопределен так, чтобы возвращать тип экшена.

Внутри каждого мини-редюсера добавляем код обновления состояния для экшена с соответствующим типом.

src/redux/reducer.js
export const tasksReducer = createReducer(tasksInitialState, {
  [addTask]: (state, action) => {
    return [...state, action.payload];
  },
  [deleteTask]: (state, action) => {
    return state.filter(task => task.id !== action.payload);
  },
  [toggleCompleted]: (state, action) => {
    return state.map(task => {
      if (task.id !== action.payload) {
        return task;
      }
      return {
        ...task,
        completed: !task.completed,
      };
    });
  },
});
export const filtersReducer = createReducer(filtersInitialState, {
  [setStatusFilter]: (state, action) => {
    return {
      ...state,
      status: action.payload,
    };
  },
});

Один из фундаментальных принципов Redux заключается в том, что редюсеры должны быть чистыми функциями, которые не изменяют текущее состояние, а возвращают новое. Это позволяет писать предсказуемый код, но иногда сильно усложняет его, так как код иммутального обновления состояния может быть довольно запутанным.

Библиотека Immer
Redux Toolkit «под капотом» использует библиотеку Immer, которая значительно упрощает логику работы с состоянием, позволяя нам писать код обновления состояния в редюсере так, как если бы мы напрямую изменяли состояние. На самом деле редюсеры получают копию состояния, а Immer преобразует все мутации в эквивалентные операции обновления.

src/redux/reducer.js
export const tasksReducer = createReducer(tasksInitialState, {
  [addTask]: (state, action) => {
    // ✅ Immer заменит это на операцию обновления
    state.push(action.payload);
  },
  [deleteTask]: (state, action) => {
    // ✅ Immer заменит это на операцию обновления
    const index = state.findIndex(task => task.id === action.payload);
    state.splice(index, 1);
  },
  [toggleCompleted]: (state, action) => {
    // ✅ Immer заменит это на операцию обновления
    for (const task of state) {
      if (task.id === action.payload) {
        task.completed = !task.completed;
      }
    }
  },
});
export const filtersReducer = createReducer(filtersInitialState, {
  [setStatusFilter]: (state, action) => {
    // ✅ Immer заменит это на операцию обновления
    state.status = action.payload;
  },
});

Написание редюсеров «изменяющих» состояние делает код короче и устраняет распространенные ошибки, допускаемые при работе с вложенным состоянием. Однако это добавляет «магии» и визуально нарушает один из фундаментальных принципов Redux.

Изменение или обновление
Иногда код иммутабельного обновления состояния более лаконичный, чем его «изменяющая» альтернатива. Например, в редюсере обработки экшена удаления задачи. В таком случае необходимо обязательно вернуть новое состояние.

src/redux/reducer.js
export const tasksReducer = createReducer(tasksInitialState, {
  [deleteTask]: (state, action) => {
    // ❌ Не правильно
    // state.filter(task => task.id !== action.payload)
    // ✅ Правильно
    return state.filter(task => task.id !== action.payload);
  },
});

Изменение или возврат
Один из подводных камней библиотеки Immer заключается в том, что в коде одного редюсера можно только либо мутировать состояние, либо вернуть обновленное, но не то и другое одновременно.

const reducer = createReducer([], {
  [doSomething]: (state, action) => {
    // ❌ Так делать нельзя, будет сгенерировано исключение
    state.push(action.payload);
    return state.map(value => value * 2);
  },
});

Планировщик задач
Разберите живой пример планировщика задач с обновленным кодом создания стора и генераторов экшенов.

createSlice
При проектировании, структура состояния Redux делится на слайсы (slice, часть), за каждый из которых отвечает отдельный редюсер. В нашем приложении планировщика задач есть два слайса - задачи (tasks) и фильтры (filters).

const appState = {
  tasks: [],
  filters: {},
};

Для каждого слайса создается стандартный набор сущностей: типы экшенов, генераторы экшенов и редюсер. Редюсеры определяют начальное состояние слайса, список экшенов влияющих на него и операции обновления состояния.

Функция createSlice() это надстройка над createAction() и createReducer(), которая стандартизирует и еще больше упрощает объявление слайса. Она принимает параметр настроек, создает и возвращает типы экшенов, генераторы экшенов и редюсер. Разберем создание слайса на примере списка задач.

import { createSlice } from "@reduxjs/toolkit";

const tasksSlice = createSlice({
  // Имя слайса
  name: "tasks",
  // Начальное состояние редюсера слайса
  initialState: tasksInitialState,
  // Объект редюсеров
  reducers: {
    addTask(state, action) {},
    deleteTask(state, action) {},
    toggleCompleted(state, action) {},
  },
});

// Генераторы экшенов
const { addTask, deleteTask, toggleCompleted } = tasksSlice.actions;
// Редюсер слайса
const tasksReducer = tasksSlice.reducer;

Свойство name определяет имя слайса, которое будет добавляться при создании экшенов, как приставка к именам редюсеров объявленным в свойстве reducers. Так мы получим экшены с типами tasks/addTask, tasks/deleteTask и tasks/toggleCompleted.

Функция createSlice() в своей реализации использует createReducer и библиотеку Immer, поэтому можно писать логику обновления состояния так, как если бы мы напрямую изменяли его.

import { createSlice } from "@reduxjs/toolkit";

const tasksInitialState = [];

const tasksSlice = createSlice({
  name: "tasks",
  initialState: tasksInitialState,
  reducers: {
    addTask(state, action) {
      state.push(action.payload);
    },
    deleteTask(state, action) {
      const index = state.findIndex(task => task.id === action.payload);
      state.splice(index, 1);
    },
    toggleCompleted(state, action) {
      for (const task of state) {
        if (task.id === action.payload) {
          task.completed = !task.completed;
          break;
        }
      }
    },
  },
});

const { addTask, deleteTask, toggleCompleted } = tasksSlice.actions;
const tasksReducer = tasksSlice.reducer;

Содержимое payload
Генератор экшена addTask ожидает только строку с текстом задачи, после чего изменяет значение payload используя функцию подготовки экшена. Вот как это выглядит сейчас в нашем коде.

src/redux/actions.js
import { createAction, nanoid } from "@reduxjs/toolkit";
export const addTask = createAction("tasks/addTask", text => {
  return {
    payload: {
      text,
      id: nanoid(),
      completed: false,
    },
  };
});

Чтобы сделать тоже самое при создании слайса, свойству в объекте редюсеров, в нашем случае addTask, необходимо передать не функцию, а объект с двумя свойствами - reducer и prepare.

import { createSlice, nanoid } from "@reduxjs/toolkit";

const tasksSlice = createSlice({
  name: "tasks",
  initialState: tasksInitialState,
  reducers: {
    addTask: {
      reducer(state, action) {
        state.push(action.payload);
      },
      prepare(text) {
        return {
          payload: {
            text,
            id: nanoid(),
            completed: false,
          },
        };
      },
    },
    // Код остальных редюсеров
  },
});

Файлы слайсов
Нам больше не нужен файл reducer.js, потому что под каждый слайс мы создадим отдельный файл. Для слайса задач это будет файл tasksSlice.js .

src/redux/tasksSlice.js
import { createSlice } from "@reduxjs/toolkit";
const tasksInitialState = [];
const tasksSlice = createSlice({
  name: "tasks",
  initialState: tasksInitialState,
  reducers: {
    addTask: {
      reducer(state, action) {
        state.push(action.payload);
      },
      prepare(text) {
        return {
          payload: {
            text,
            id: nanoid(),
            completed: false,
          },
        };
      },
    },
    deleteTask(state, action) {
      const index = state.findIndex(task => task.id === action.payload);
      state.splice(index, 1);
    },
    toggleCompleted(state, action) {
      for (const task of state) {
        if (task.id === action.payload) {
          task.completed = !task.completed;
          break;
        }
      }
    },
  },
});
// Экспортируем генераторы экшенов и редюсер
export const { addTask, deleteTask, toggleCompleted } = tasksSlice.actions;
export const tasksReducer = tasksSlice.reducer;

И файл filtersSlice.js для слайса фильтров.

src/redux/filtersSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { statusFilters } from "./constants";
const filtersInitialState = {
  status: statusFilters.all,
};
const filtersSlice = createSlice({
  name: "filters",
  initialState: filtersInitialState,
  reducers: {
    setStatusFilter(state, action) {
      state.status = action.payload;
    },
  },
});
// Экспортируем генераторы экшенов и редюсер
export const { setStatusFilter } = filtersSlice.actions;
export const filtersReducer = filtersSlice.reducer;

Создание стора
В файле создания стора необходимо изменить код импорта редюсеров.

src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
//=============== Before ========================
// import { tasksReducer, filtersReducer } from "./reducer";
//=============== After ========================
import { tasksReducer } from "./tasksSlice";
import { filtersReducer } from "./filtersSlice";
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    filters: filtersReducer,
  },
});

Генераторы экшенов
Генераторы экшенов теперь создаются автоматически для каждого слайса. Это значит, что нам больше не нужно вручную объявлять их в отдельном файле используя createAction(). Мы можем удалить файл actions.js и обновить импорты генераторов экшенов в файлах компонентов. Структура файлов проекта теперь будет выглядеть следующим образом.

Slice based file structure
Импорты генераторов экшенов делаются из соответствующего файла слайса.

//=============== Before ========================
// import { deleteTask, toggleCompleted } from "redux/actions";
//=============== After ========================
import { deleteTask, toggleCompleted } from "redux/tasksSlice";

Планировщик задач
Разберите живой пример планировщика задач с обновленным кодом создания стора и генераторов экшенов.

