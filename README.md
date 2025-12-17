
# AI Virtual Try-On Stylist

Bu uygulama, Gemini 2.5 Flash modelini kullanarak kullanıcılara fotoğrafları üzerinden sanal kıyafet deneme imkanı sunar.

## Kurulum ve Yayınlama

1. Bu projeyi GitHub'a yükleyin.
2. [Vercel](https://vercel.com) veya [Netlify](https://netlify.com) üzerinden projeyi bağlayın.
3. **ÖNEMLİ:** Dağıtım ayarlarında (Environment Variables) `API_KEY` adında bir değişken oluşturun ve Google AI Studio'dan aldığınız Gemini API anahtarınızı buraya yapıştırın.

## Özellikler
- **Sanal Giydirme:** Kendi fotoğrafınızı ve bir kıyafet fotoğrafını yükleyerek sonucu görün.
- **Hızlı Düzenleme:** Fotoğraflarınızı metin komutlarıyla (örn: "arkaplanı değiştir", "gözlük ekle") güncelleyin.
- **Mobil Uyumlu:** PWA desteği sayesinde telefonunuza uygulama olarak ekleyebilirsiniz.

## Teknolojiler
- React 19
- Tailwind CSS
- Google Gemini API (gemini-2.5-flash-image)
- Vite
