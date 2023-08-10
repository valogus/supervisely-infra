# supervisely-infra
1. Склонировать репозиторий.
2. Создать файл .env и положить в него MAILBLUSTER_AUTH_TOKEN
3. Создать папку data и положить в нее требуемые csv файлы.
4. Запустить команду docker compose up.

Пример вывода:
```
supervisely-infra-infra-1  | Processed ./data/test.csv
supervisely-infra-infra-1  | Unsubscribed valogus123@mail.ru: Lead updated
supervisely-infra-infra-1  | Unsubscribed valogus123@gmail.com: Lead updated
supervisely-infra-infra-1  | Log file saved: logs/log_2023-08-10T19:28:23.309Z.txt
supervisely-infra-infra-1  | Unsubscribed: 2
```