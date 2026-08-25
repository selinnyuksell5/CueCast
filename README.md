# CueCast

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-41-47848F?style=flat&logo=electron&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

Radyo spikerleri için geri sayım ve müzik cue aracı. Geri sayım bittiğinde playlist’teki parçayı otomatik çalar; masaüstü uygulaması olarak Electron ile de çalışır.

## Özellikler

- Ayarlanabilir geri sayım (5 / 10 / 15 / 20 / 30 / 60 sn)
- Çok parçalı playlist yükleme ve yönetimi
- Cue sonrası otomatik müzik çalma
- Ses seviyesi, mute, pause / stop kontrolleri
- Yayın odasına uygun koyu arayüz (READY / COUNTING / STANDBY / ON AIR durumları)
- Web (Next.js) ve masaüstü (Electron) desteği

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Dil | TypeScript |
| UI | React 19 |
| Framework | Next.js 16 |
| Stil | Tailwind CSS 4 |
| İkonlar | Lucide React |
| Masaüstü | Electron 41 |
| Paketleme | electron-builder |

## Kurulum

```bash
npm install
```

## Kullanım

### Web (geliştirme)

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### Masaüstü (Electron)

Next.js ile birlikte Electron penceresini açar:

```bash
npm run desktop
```

Sadece Electron (dev sunucusu zaten çalışıyorsa):

```bash
npm run electron
```

### Production build

```bash
npm run build
npm start
```

Windows portable uygulama paketi:

```bash
npm run dist
```

Çıktı `dist/` klasörüne yazılır.

## Proje yapısı

```
CueCast/
├── main.js              # Electron giriş noktası
├── package.json
├── src/
│   └── app/
│       ├── page.tsx     # Ana spiker / countdown arayüzü
│       ├── layout.tsx
│       └── globals.css
├── tailwind.config.js
└── tsconfig.json
```

## Lisans

ISC
