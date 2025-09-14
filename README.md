___TO-DO tracker app___
# Для запуска <br>
1. склонировать репозиторий <br>
<!-- --> 
```git clone https://github.com/RdotF/to-do-mood-tracker.git```<br>
<!-- --> 
2. создать virtual env<br>
<!-- -->
```python -m venv venv```
<!-- -->
```source venv/bin/activate #для Mac```
<!-- -->
3. скачать необходимыe пакеты <br>
<!-- -->
```(в папке to_do_tracker) pip install -r requirements.txt ```
<!-- -->
4. Запустить сервер  <br>
<!-- -->
```python manage.py runserver```
# Для фронта <br>
```
/your_project/
├── /todo/
│   ├── /migrations/
│   ├── views.py
│   ├── models.py
│   └── ...
├── /frontend/              # Папка для фронта
│   ├── /static/            #CSS и JS идут сюда
│   │   └── /frontend/
│   │       ├── css/
│   │       ├── js/
│   │       └── images/     #Если нужно, создайте еще папку для отдельных элементов
│   ├── /templates/         #Страницы идут сюда HTML
│   │   └── /frontend/
│   │       ├── login.html
│   │       ├── index.html
│   │       └── ...
│   ├── views.py
│   └── ...
└── manage.py
```
<!-- -->

# Как работают ссылки
По пути **\frontend\urls.py** уже обозначены index и login страницы <br>
<!-- -->
```
urlpatterns = [
  #path("путь", название view, метка названия)
    path('', index, name='index'),  # Главная страница
    path('login/', login, name='login')
    # Другие пути
]
```
<!-- -->
### Их устройство: <br>
<ul> 
  <li>path() - функция, обозначающая новый путь в приложении</li> <br>
  <li>'login/' - путь до страницы, которую вводим в браузере</li> <br>
  <li>login - view, который выводит страницу (см ниже)</li> <br>
  <li>name='login' - тег имени страницы, не особо важен</li> <br>
</ul>


### View <br>
По пути **\frontend\views.py** есть примеры обозначения views <br>
<!-- -->
```
from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'frontend/index.html') 

def login(request):
    return render(request, 'frontend/login.html') 
```
<!-- -->
Это функции, которые рендарят html странички. указывать путь **'frontend/page.html'** <br>
# Как переходить на другие страницы <br>
Так же, как это сделали бы без views и paths. Если пути уже обозначены, то в html можно реализовать через ссылку:<br>
<!-- -->
```
<a href="/path">Go to Home</a> 
```
<!-- -->
или же через кнопку:<br>
<!-- -->
```
  <button id="goToHome">Go to Home</button>
  <script>
    // Обработчик события для кнопки "Go to Home"
    document.getElementById('goToHome').addEventListener('click', function() {
      window.location.href = '/';
    });
```
<!-- -->
<img width="465" height="191" alt="image" src="https://github.com/user-attachments/assets/cd9cdc7d-7244-4697-a680-d5888d94a0b2" />

