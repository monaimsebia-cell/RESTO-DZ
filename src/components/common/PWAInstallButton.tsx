import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { language } = useApp();

  if (isInstalled) {
    return (
      <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {language === 'ar' ? 'مثبّت كـ PWA' : language === 'fr' ? 'Installé (PWA)' : 'Installed PWA'}
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-md shadow-red-950/40 transition active:scale-95"
        title="Installer RESTO-DZ en application autonome"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{language === 'ar' ? 'تثبيت التطبيق' : language === 'fr' ? 'Installer l’App' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-medium transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-red-400" />
          <span>{language === 'ar' ? 'تثبيت على iOS' : language === 'fr' ? 'Installer sur iOS' : 'Install on iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-[#16161A] border border-zinc-800 p-6 shadow-2xl text-zinc-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
                    DZ
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'ar' ? 'تثبيت على iPhone / iPad' : language === 'fr' ? 'Installer sur iPhone / iPad' : 'Install on iOS Device'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                  <span className="w-6 h-6 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <p>
                    {language === 'ar'
                      ? 'اضغط على زر المشاركة (Share) في شريط Safari بالأسفل.'
                      : language === 'fr'
                      ? 'Appuyez sur le bouton Partager dans la barre d’outils Safari.'
                      : 'Tap the Share button in Safari toolbar.'}
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                  <span className="w-6 h-6 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <p>
                    {language === 'ar'
                      ? 'قم بالتمرير واضغط على "إضافة إلى الشاشة الرئيسية" (Sur l’écran d’accueil).'
                      : language === 'fr'
                      ? 'Faites défiler vers le bas et sélectionnez "Sur l’écran d’accueil".'
                      : 'Scroll down and tap "Add to Home Screen".'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-white transition"
              >
                {language === 'ar' ? 'فهمت' : language === 'fr' ? 'Compris' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop / ambient install badge button
  return (
    <button
      onClick={() => {
        alert(
          language === 'ar'
            ? 'لتثبيت RESTO-DZ كشاشة لمس في المطعم، استخدم خيار "تثبيت التطبيق" من شريط عنوان المتصفح (Chrome أو Edge).'
            : language === 'fr'
            ? 'Pour installer RESTO-DZ en plein écran sur votre caisse ou tablette, cliquez sur l’icône d’installation dans la barre de votre navigateur (Chrome/Edge).'
            : 'To install RESTO-DZ for touchscreens, use the Install App icon in your browser address bar.'
        );
      }}
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-medium transition"
      title="Application PWA autonome"
    >
      <Download className="w-3.5 h-3.5 text-red-400" />
      <span>{language === 'ar' ? 'تطبيق PWA' : language === 'fr' ? 'PWA Caisses' : 'PWA App'}</span>
    </button>
  );
};
