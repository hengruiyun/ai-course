@echo off
echo Starting to download images for personal website...
echo.

REM Create images directory if it doesn't exist
if not exist "images" mkdir images

echo Downloading project images...
echo.

REM Five in a row game image
echo [1/4] Downloading Five in a Row game image...
curl -L "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop" -o "images/wuziqi.jpg"
if %errorlevel% neq 0 (
    echo Warning: Failed to download wuziqi.jpg
) else (
    echo Successfully downloaded wuziqi.jpg
)

REM Lottery app image  
echo [2/4] Downloading lottery app interface image...
curl -L "https://images.unsplash.com/photo-1559526324-593bc073d938?w=600&h=800&fit=crop" -o "images/lottery.jpg"
if %errorlevel% neq 0 (
    echo Warning: Failed to download lottery.jpg
) else (
    echo Successfully downloaded lottery.jpg
)

REM Constellation app image
echo [3/4] Downloading constellation app image...
curl -L "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=600&h=800&fit=crop" -o "images/constellation.jpg"
if %errorlevel% neq 0 (
    echo Warning: Failed to download constellation.jpg
) else (
    echo Successfully downloaded constellation.jpg
)

REM Website navigation image
echo [4/4] Downloading website navigation image...
curl -L "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop" -o "images/website-navigation.jpg"
if %errorlevel% neq 0 (
    echo Warning: Failed to download website-navigation.jpg
) else (
    echo Successfully downloaded website-navigation.jpg
)

echo.
echo Image download process completed!
echo.
echo Note: If any downloads failed, you can manually download images from:
echo - Unsplash.com
echo - Pixabay.com  
echo - Pexels.com
echo.
echo Search for keywords like:
echo - "game board" or "strategy game" for wuziqi.jpg
echo - "mobile app" or "smartphone interface" for lottery.jpg
echo - "constellation" or "astrology app" for constellation.jpg
echo - "website" or "web development" for website-navigation.jpg
echo.
pause 