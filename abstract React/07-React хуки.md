Введение
react hooks banner
Раньше компоненты-функции использовались только для рендера HTML-разметки по полученным пропсам и шаблону. У них не было ни состояния, ни методов жизненного цикла. Они были очень простыми. Часто, в процессе разработки проекта, возникает ситуация, когда компоненту-функции необходимо было добавить состояние или методы жизненного цикла. Приходилось переписывать его в компонент-класс, а это занимает время, потому что кроме добавления нового функционала, разработчику приходилось рефакторить уже написанный код.

Необходимость стандартизировать написание компонентов в одном стиле, а также расширение возможностей повторного использования кода, подтолкнули разработчиков React к созданию хуков. Это расширило возможности компонентов-функций. Хуки оказались настолько удобны, что стали основой React-разработки.

Хуки решают множество проблем в React, с которыми разработчики сталкивались с момента выхода библиотеки.

Сложность повторного использования логики с состоянием между компонентами. Для этого можно создавать собственные хуки.
Использование неудобных паттернов «рендер-пропс» (render props) и «компонент высшего порядка» (higher order component), которые сильно изменяют структуру компонентов и делают код громоздким.
Поддержка несвязанной логики в методах жизненного цикла и наоборот разделение связанной логики на несколько методов. Например, подписка на событие в componentDidMount и отписка в componentWillUnmount.
Невозможность разбить большой компонент на более мелкие из-за логики завязанной на синтаксис класса.
Особенности связанные с поведением ключевого слова this при привязке контекста и передаче метода класса как пропса.
ОБРАТНАЯ СОВМЕСТИМОСТЬ
Хуки полностью обратно совместимы с классами. В более старых проектах, новый функционал можно писать на хуках, не изменяя уже написанный код в классах. Хуки не содержат изменений, которые могут поломать существующий код. Хуки не требуют новых знаний о концепциях в React. Вместо этого, хуки предоставляют более прямой доступ к API уже знакомых понятий: пропсов, состояния, контекста, рефов, и жизненного цикла.

Хук useState
Первый, простой, и самый важный хук. Из названия понятно, что он связан с состоянием компонента. Именно благодаря ему у функциональных компонентов появилось внутреннее состояние.

import { useState } from "react";

const App = () => {
  const [value, setValue] = useState(0);

  return (
    <div>
      {value}
      <button type="button" onClick={() => setValue(value + 1)}>
        Increment value by 1
      </button>
    </div>
  );
};

Вызов хука useState создаёт состояние и метод который будет менять его значение. В качестве параметра хук принимает начальное состояниия, в нашем случае число 0. В состоянии может храниться любой тип данных.

Хук useState возвращает массив из двух элементов: первый - текущее значение состояния, второй - функцию для его изменения, которую можно использовать где угодно, например, в обработчике событий. React будет хранить это состояние между рендерами. Используя деструктуризацию, можно задать любые имена переменных.

ЧТО ЖЕ ТАКОЕ ХУКИ?
Хуки - это просто функции, с помощью которых можно «подцепиться» к состоянию и методам жизненного цикла из компонентов-функций и использовать React без классов. Хуки не работают внутри классов.

Различие с классами
Функция обновления состояния схожа с this.setState в классах, но не сшивает новое и старое состояние вместе в случае если в состоянии хранится объект. В остальном всё как с обычным состоянием компонента. Основное отличие: в классовом компоненте мы можем создать только одно общее состояние, а в функциональном - сколько угодно, и они будут независимы друг от друга.

// ❌ Плохо
const App = () => {
  const [state, setState] = useState({
    username: "",
    todos: [{ text: "Learn hooks" }],
    isModalOpen: false,
  });
};

// ✅ Хорошо
const App = () => {
  const [username, setUsername] = useState("");
  const [todos, setTodos] = useState([{ text: "Learn hooks" }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
};

ЛУЧШИЕ ПРАКТИКИ
Не храните в состоянии объект с несколькими несвязанными свойствами. Лучше сделать несколько независимых состояний и обновлять их атомарно, как в примере выше. Это не влияет на производительность.

Ограничения хуков
Хуки можно использовать только в функциональных компонентах. Любые хуки можно вызывать только на верхнем уровне компонента-функции. То есть, вне циклов, условий, вложенных функций и т. п. Это значит что хук или есть в компоненте, или его нет. Такие возможно странные ограничения стандартизируют написание логики компонента и делают код менее запутанным.

// ❌ Будет ошибка
const App = () => {
  if (isLoggedIn) {
    const [username, setUsername] = useState("");
  }

  // ...
};

// ✅ Так правильно использовать хуки
const App = () => {
  const [username, setUsername] = useState("");
};

Хук useEffect
Методы жизненного цикла служат для того, чтобы совершать какие-то операции на разных стадиях жизни компонента. Например, запрашивать данные с бэкенда, добавлять подписки событий и т. п. Все это называется «побочные эффекты». С помощью хука useEffect в компонентах-функциях можно выполнять все эти «эффекты», смоделировав работу трех методов жизненного цикла - componentDidMount, componentDidUpdate, componentWillUnmount, объединив их в один API.

import { useState, useEffect } from "react";

const App = () => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${value} times`;
  });

  return (
    <div>
      <p>You clicked {value} times</p>
      <button onClick={() => setValue(value + 1)}>Click me</button>
    </div>
  );
};

useEffect(callback, deps) принимает два аргумента:

callback - функция, внутри которой выполняется вся логика эффекта. Например, запросы на сервер, задание обработчиков событий на документ и т.п.
зависимости - массив переменных, при изменении любой из которых, будет запускаться эффект и выполняеться callback. Это может быть состояние, пропсы или любое локальное значение внутри компонента.
ЗАВИСИМОСТИ
Если не передать массив зависимостей, еффект будет выполняться на каждом рендере компонента. Именно благодаря массиву зависимостей мы можем имитировать методы жизненного цикла.

Аналог componentDidMount
Хук useEffect запускается не только при изменении элементов массива зависимостей, но также и сразу после монтирования компонента. Если мы укажем в качестве второго аргумента пустой массив, callback запустится на стадии монтирования компонента, и больше никогда.

const App = () => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    console.log("Mouting phase: same when componentDidMount runs");
  }, []);

  return <button onClick={() => setValue(value + 1)}>{value}</button>;
};

Аналог componentDidUpdate
В массиве необходимо перечислить все зависимости эффекта. Так получаем более гибкий аналог метода componentDidUpdate, который запускается только при изменении определенных значений. При этом важно учитывать, что такой еффект запускается и на стадии монтирования, что абсолютно нормально в большинстве случаев.

const App = () => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    console.log(value);
    console.log("Updating phase: same when componentDidUpdate runs");
  }, [value]);

  return <button onClick={() => setValue(value + 1)}>{value}</button>;
};

Список зависимостей
В приложении созданном при помощи утилиты Create React App настройки ESLint включают в себя правило react-hooks/exhaustive-deps, проверяющее обязательное наличие всех используемых внешних переменных (состояния, пропсов и т.п.) в массиве зависимостей. Если вы написали эффект и линтер указывает на проблемы со списком зависимостей - ваш эффект работает нестабильно и непредсказуемо. Добавьте все необходимые зависимости эффекта.

const App = () => {
  const [firstValue, setFirstValue] = useState(0);
  const [secondValue, setSecondValue] = useState(0);

  // ❌ Плохо. ESLint покажет предупреждение
  useEffect(() => {
    console.log(firstValue + secondValue);
  }, [firstValue]);

  // ✅ Хорошо. Указаны все зависимости использующиеся внутри эффекта
  useEffect(() => {
    console.log(firstValue + secondValue);
  }, [firstValue, secondValue]);

  return (
    <>
      <button onClick={() => setFirstValue(value + 1)}>First: {value}</button>
      <button onClick={() => setSecondValue(value + 1)}>Second: {value}</button>
    </>
  );
};

Аналог componentWillUnmount
Для того чтобы выполнить код при размонтировании компонента, или вообще перед каждым вызовом эффекта, возвращаем из useEffect функцию очистки с необходимым кодом. Это и есть аналог componentWillUnmount. Так можно снимать обработчики событий, останавливать таймеры и отменять HTTP-запросы.

const App = () => {
  useEffect(() => {
    console.log("Mounting phase: same when componentDidMount runs");

    return () => {
      console.log("Unmounting phase: same when componentWillUnmount runs");
    };
  }, []);

  return null;
};

Несколько эффектов
Хуки позволяют разделить и сгруппировать логику, создав «эффект» под каждую независимую операцию.

class App extends Component {
  handleKeyDown = e => {
    console.log("keydown event: ", e);
  };

  componentDidMount() {
    initThirdPartyLibrary();
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      // Do stuff when value prop changes
    }

    if (prevState.isLoggedIn !== this.state.isLoggedIn) {
      // Do stuff when isLoggedIn state changes
    }

    if (prevProps.username !== this.props.username) {
      // Fetch user when username prop changes
      fetchUser(this.props.username);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }
}

const App = () => {
  // 1. Run effect only on mount to init some library
  useEffect(() => {
    initThirdPartyLibrary();
  }, []);

  // 2. Run effect only when username prop changes
  useEffect(() => {
    fetchUser(username);
  }, [username]);

  // 3. Run effect on value prop change
  useEffect(() => {
    // Do stuff when value prop changes
  }, [value]);

  // 4. Run effect on isLoggedIn state change
  useEffect(() => {
    // Do stuff when isLoggedIn state changes
  }, [isLoggedIn]);

  // 5. Run effect on mount and clean up on unmount
  useEffect(() => {
    const handleKeyDown = e => console.log("keydown event: ", e);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
};

Собственные хуки
ВНИМАНИЕ
Создание собственных хуков требует опыта работы с хуками и React в целом. Не стоит специально стремиться сделать в проекте собственные хуки. Если вы явно видите возможность повторного использования кода - отлично, сделайте собственный хук. В противном случае лучше сконцентрироваться на изучении основного материала и использовании встроенных React-хуков или готовых хуков из библиотек вроде react-use.

Первостепенная задача хуков - упростить повторное использование кода (логики) для разработчиков. Создание собственных хуков это процесс извлечения логики компонентов в повторно используемые функции. Это сделает код проекта чище и легче в поддержке.

Хук это просто функция имя которой обязательно начинается с приставки use. Именно по ней React будет определять это обычная функция или хук. Например: useState, useEffect, useToggle, useDevice, useImages и так далее. Собственные хуки создаются вне тела компонента, часто даже в отельных файлах, и могут вызывать другие хуки, так достигается простое повторное использование кода.

Хук useToggle
Рассмотрим пример где в двух компонентах необходима логика открытия, закрытия и переключения элемента интерфейса, например модального окна.

// ComponentA.jsx
const ComponentA = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button onClick={openModal}>Open modal</button>
      <ModalA isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

// ComponentB.jsx
const ComponentB = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button onClick={openModal}>Open modal</button>
      <ModalB isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

Создание состояния и методов для открытия/закрытия модального окна идентично в каждом компоненте, то есть происходит дублирование кода. Представьте что будет в проекте где модальные окна открываются десятки или сотни раз. Создадим собственный хук useToggle в котором скроем создание состояния и методов работы с ним.

src/hooks/useToggle.js
export const useToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(isOpen => !isOpen);

  return { isOpen, open, close, toggle };
};

СИГНАТУРА ХУКА
Собственный хук может принимать любые аргументы и возвращать что угодно, правил нет, зависит от реализации. В нашем случае это объект с четырьмя свойствами.

Тогда код из предыдущего примера будет выглядеть следующим образом.

// ComponentA.jsx
import { useToggle } from "path/to/hooks/useToggle.js";

const ComponentA = () => {
  const { isOpen, open, close } = useToggle();

  return (
    <>
      <button onClick={open}>Open modal</button>
      <ModalA isOpen={isOpen} onClose={close} />
    </>
  );
};

// ComponentB.jsx
import { useToggle } from "path/to/hooks/useToggle.js";

const ComponentB = () => {
  const { isOpen, open, close } = useToggle();

  return (
    <>
      <button onClick={open}>Open modal</button>
      <ModalB isOpen={isOpen} onClose={close} />
    </>
  );
};

РЕЗУЛЬТАТ
Даже в таком простом случае мы значительно сократили дублирование кода, структурировали файлы проекта, сделали компоненты чище и упростили будущий рефактор компоннетов и логики хука.

Так как хуки это обычные функции, им можно передавать аргументы, например для начального значения состояния. Расширим хук useToggle так, чтобы можно было сделать модальное окно изначально открытым. По умолчанию делаем его закрытым.

// src/hooks/useToggle.js
export const useToggle = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(isOpen => !isOpen);

  return { isOpen, open, close, toggle };
};

// MyComponent.jsx
import { useToggle } from "path/to/hooks/useToggle.js";

const MyComponent = () => {
  const { isOpen, open, close } = useToggle(true);

  return (
    <>
      <button onClick={open}>Open modal</button>
      <Modal isOpen={isOpen} onClose={close} />
    </>
  );
};

