# FastFix

FastFix — адаптивний багатосторінковий сайт сервісу пошуку майстрів для ремонту техніки. Проєкт містить каталог послуг, форму заявки, профіль користувача та калькулятор вартості ремонту.

## Демо

- [Netlify](https://fast-fixx.netlify.app)
- [GitHub Pages](https://sergiy66.github.io/FastFix/)
- [Vercel](https://fastfix-six.vercel.app/)

## Технології

- HTML5
- Tailwind CSS
- JavaScript
- локальні шрифти Inter і Manrope
- Netlify та GitHub Pages

## Структура

```text
FastFix/
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
├── css/
│   ├── style.css
│   ├── tailwind-input.css
│   └── tailwind.css
├── js/
│   └── app.js
├── index.html
├── about.html
├── account.html
├── calculator.html
├── request.html
└── technology.html
```

## Локальний запуск

Збірка не потрібна: готовий Tailwind CSS уже збережений у репозиторії.

```bash
python -m http.server 8080
```

Відкрийте `http://localhost:8080`.

## Тести

```bash
npm install
npm test
```

Тести перевіряють RegEx-правила та DOM-поведінку форми зворотного зв&rsquo;язку.

## Сторінки

- `index.html` — головна сторінка
- `about.html` — інформація про сервіс
- `technology.html` — категорії техніки
- `request.html` — створення заявки
- `calculator.html` — калькулятор ремонту
- `account.html` — кабінет користувача

## Розгортання

Сайт статичний. Для публікації коренем сайту має бути корінь репозиторію; build-команда не потрібна.
