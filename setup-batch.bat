@echo off
echo Bunda API - Bestandsstructuur aanmaken
echo ====================================

REM Maak hoofdmap aan
mkdir api
cd api

REM Maak src map en submappen aan
mkdir src
mkdir src\config
mkdir src\models
mkdir src\controllers
mkdir src\routes
mkdir src\middleware
mkdir src\services
mkdir src\utils

REM Maak tests map aan
mkdir tests

REM Maak lege bestandsstructuur aan voor config bestanden
echo. > src\config\app.config.js
echo. > src\config\database.js

REM Maak lege bestandsstructuur aan voor app.js en server.js
echo. > src\app.js
echo. > server.js

REM Maak lege bestandsstructuur aan voor package.json
echo { "name": "bunda-api" } > package.json

REM Maak lege bestandsstructuur aan voor models
echo. > src\models\gebruiker.model.js
echo. > src\models\woning.model.js
echo. > src\models\woningAfbeelding.model.js
echo. > src\models\kenmerk.model.js
echo. > src\models\woningKenmerk.model.js
echo. > src\models\favoriet.model.js
echo. > src\models\bezichtiging.model.js
echo. > src\models\index.js

REM Maak lege bestandsstructuur aan voor controllers
echo. > src\controllers\auth.controller.js
echo. > src\controllers\gebruiker.controller.js
echo. > src\controllers\woning.controller.js
echo. > src\controllers\afbeelding.controller.js
echo. > src\controllers\favoriet.controller.js
echo. > src\controllers\kenmerk.controller.js
echo. > src\controllers\bezichtiging.controller.js
echo. > src\controllers\beheerder.controller.js

REM Maak lege bestandsstructuur aan voor routes
echo. > src\routes\auth.routes.js
echo. > src\routes\gebruiker.routes.js
echo. > src\routes\woning.routes.js
echo. > src\routes\afbeelding.routes.js
echo. > src\routes\favoriet.routes.js
echo. > src\routes\kenmerk.routes.js
echo. > src\routes\bezichtiging.routes.js
echo. > src\routes\beheerder.routes.js

REM Maak lege bestandsstructuur aan voor middleware
echo. > src\middleware\auth.middleware.js
echo. > src\middleware\validatie.middleware.js
echo. > src\middleware\error.middleware.js
echo. > src\middleware\upload.middleware.js

REM Maak lege bestandsstructuur aan voor services
echo. > src\services\auth.service.js
echo. > src\services\gebruiker.service.js
echo. > src\services\woning.service.js
echo. > src\services\afbeelding.service.js
echo. > src\services\favoriet.service.js
echo. > src\services\kenmerk.service.js
echo. > src\services\bezichtiging.service.js
echo. > src\services\beheerder.service.js

REM Maak lege bestandsstructuur aan voor utils
echo. > src\utils\geo.utils.js
echo. > src\utils\validator.utils.js

REM Maak uploads map aan voor afbeeldingen
mkdir uploads
mkdir uploads\afbeeldingen

REM Maak lege bestandsstructuur aan voor tests
echo. > tests\auth.test.js
echo. > tests\woning.test.js

echo.
echo Bestandsstructuur succesvol aangemaakt!
echo De volgende mappenstructuur is aangemaakt:
echo.
echo bunda-api/
echo  ├── src/
echo  │   ├── config/             
echo  │   ├── models/             
echo  │   ├── controllers/        
echo  │   ├── routes/             
echo  │   ├── middleware/         
echo  │   ├── services/           
echo  │   ├── utils/              
echo  │   └── app.js              
echo  ├── tests/                  
echo  ├── uploads/                
echo  │   └── afbeeldingen/       
echo  ├── package.json            
echo  └── server.js               
echo.
echo U kunt nu beginnen met het toevoegen van code aan de bestanden!

cd ..
