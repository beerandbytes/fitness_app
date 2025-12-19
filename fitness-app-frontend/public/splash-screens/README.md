# PWA Splash Screens

This directory should contain splash screens for iOS and Android devices.

## iOS Splash Screens

iOS splash screens should be named according to device sizes:
- `splash-iphone-se.png` - 640x1136 (iPhone SE)
- `splash-iphone-8.png` - 750x1334 (iPhone 8)
- `splash-iphone-8-plus.png` - 1242x2208 (iPhone 8 Plus)
- `splash-iphone-x.png` - 1125x2436 (iPhone X)
- `splash-iphone-xs-max.png` - 1242x2688 (iPhone XS Max)
- `splash-ipad.png` - 1536x2048 (iPad)
- `splash-ipad-pro.png` - 2048x2732 (iPad Pro)

## Android Splash Screens

Android splash screens are typically handled through the manifest.json and theme colors, but you can also create:
- `splash-android-portrait.png` - 1080x1920
- `splash-android-landscape.png` - 1920x1080

## Implementation

Splash screens are configured in the manifest.json file. The background color and theme color are used to create the splash screen effect.

For iOS, add meta tags in index.html:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-startup-image" href="/splash-screens/splash-iphone-x.png">
```

## Current Status

Splash screens are configured via manifest.json theme colors. Custom splash screen images can be added here for enhanced branding.

