HTTP-запросы
Допустим, уже есть дерево компонентов, которое имеет несколько уровней иерархии и необходимо получить коллекцию элементов от API. Какой именно компонент в иерархии должен отвечать за HTTP-запросы и хранение результата ответа? Если не используем библиотеку управления состоянием, то это зависит от трех критериев.

Каким компонентам будут необходимы полученные данные?
Где будет рендерится индикатор загрузки пока выполянется HTTP-запрос?
Где будет рендерится сообщение в случае ошибки HTTP-запроса?
Методы жизненного цикла componentDidMount и componentDidUpdate идеально подходят для HTTP-запросов. Когда вызывается componentDidMount(), компонент уже был отрендерен в DOM и готов к последующему обновлению состояния. Когда вызывается componentDidUpdate(), пропы или состояние компонента изменились, и, возможно, необходимо сделать новый запрос, предварительно сравнив их, чтобы не зациклить рендер компонента.

Для HTTP-запроса можно использовать что угодно: XMLHTTPRequest, fetch, axios, superagent и т. п. Мы будем использовать библиотеку axios.

npm install axios

Запросы будем делать на Hacker News API. По завершению HTTP-запроса сохраняем результат в состоянии компонента. В методе render используем состояние.

import React, { Component } from "react";
import axios from "axios";

axios.defaults.baseURL = "https://hn.algolia.com/api/v1";

const ArticleList = ({ articles }) => (
  <ul>
    {articles.map(({ objectID, url, title }) => (
      <li key={objectID}>
        <a href={url} target="_blank" rel="noreferrer noopener">
          {title}
        </a>
      </li>
    ))}
  </ul>
);

class App extends Component {
  state = {
    articles: [],
  };

  async componentDidMount() {
    const response = await axios.get("/search?query=react");
    this.setState({ articles: response.data.hits });
  }

  render() {
    const { articles } = this.state;
    return (
      <div>
        articles.length > 0 ? <ArticleList articles={articles} /> : null
      </div>
    );
  }
}

Кроме поля хранения данных, можно добавить поле для хранения флага индикатора загрузки и ошибки. Это позволит сделать использование интерфейса приятнее для пользователя.

Индикатор загрузки
Пока ждем ответа на HTTP-запрос, показываем идтикатор загрузки. Как только пришел ответ, прячем индикатор. Для этого на старте запроса ставим isLoading в true, а при успешном ответе или ошибке в false.

/* ... */

class App extends Component {
  state = {
    articles: [],
    isLoading: false,
  };

  async componentDidMount() {
    this.setState({ isLoading: true });
    const response = await axios.get("/search?query=react");
    this.setState({
      articles: response.data.hits,
      isLoading: false,
    });
  }

  /* ... */
}

В методе render по условию возвращаем разметку. Если данные загружаеются, показываем лоадер, в противном случае список с результатами.

/* ... */

class App extends Component {
  /* ... */

  render() {
    const { articles, isLoading } = this.state;
    return (
      <div>
        isLoading ? <p>Loading...</p> : <ArticleList articles={articles} />
      </div>
    );
  }
}

Индикатор загрузки может быть чем угодно, от простого текста или спиннера, до кастомного компонента, например react-content-loader.

Обработка ошибки
HTTP-запрос не всегда выполняется без ошибок, поэтому пользователю обязательно нужно дать понять если что-то пошло не так. Для этого в состояние добавляем свойство хранения ошибки.

При использовании промисов, для обработки ошибок используется блок catch, если он выполнится значит произошла ошибка. Установку индикатора загрузки переносим в блок finally, чтобы не дублировать код, который будет выполнен в любом случае.

/* ... */

class App extends Component {
  state = {
    articles: [],
    isLoading: false,
    error: null,
  };

  async componentDidMount() {
    this.setState({ isLoading: true });

    try {
      const response = await axios.get("/search?query=react");
      this.setState({ articles: response.data.hits });
    } catch (error) {
      this.setState({ error });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  /* ... */
}

Осталось дополнить метод render.

/* ... */
class App extends Component {
  /* ... */
  render() {
    const { articles, isLoading, error } = this.state;

    return (
      <div>
        {error && <p>Whoops, something went wrong: {error.message}</p>}
        {isLoading && <p>Loading...</p>}
        {articles.length > 0 && <ArticleList articles={articles} />}
      </div>
    );
  }
}

Разделение отвественности
Хранить код связанный с HTTP-запросом прямо в компоненте не лучшая практика. В приложении будет много разных запросов на API и использоваться они будут в разных компонентах. К тому же код HTTP-запросов может быть сложным и громоздким. Для удобства рефакторинга будем хранить все в одном месте.

Создадим дополнительную папку внутри src. Название папки произвольное но логичное, например helpers, api, services и т. д. В этой папке будем хранить файл с функциями для HTTP-запросов.

// services/api.js
import axios from "axios";

export const fetchArticlesWithQuery = async searchQuery => {
  const response = axios.get(`/search?query=${searchQuery}`);
  return response.data.hits;
};

export default {
  fetchArticlesWithQuery,
};

Импортируем сервис в файле компонента и вызываем нужный метод.

/* ... */
import api from "./path/to/services/api";

class App extends Component {
  state = {
    articles: [],
    isLoading: false,
    error: null,
  };

  async componentDidMount() {
    this.setState({ isLoading: true });

    try {
      const articles = api.fetchArticlesWithQuery("react");
      this.setState({ articles });
    } catch (error) {
      this.setState({ error });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  /* ... */
}