import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Building,
  CheckSquare,
  Palette,
  MapPin,
  Utensils,
  UserPlus,
  CreditCard,
  Rocket,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BusinessType, Language } from '../../core/types';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({ isOpen, onClose }) => {
  const { registerNewTenant, plans, t } = useApp();
  const [step, setStep] = useState<number>(1);

  // Form State across the 8 steps
  const [formData, setFormData] = useState({
    name: 'Tassili Grill & Burger',
    businessType: 'burger_restaurant' as BusinessType,
    phone: '+213 555 44 33 22',
    email: 'contact@tassili-burger.dz',
    address: '14 Boulevard Zighout Youcef',
    city: 'Alger',
    country: 'Algérie',
    currency: 'DA',
    timezone: 'Africa/Algiers',
    defaultLanguage: 'fr' as Language,
    
    // Step 2: Services
    services: {
      dineIn: true,
      takeaway: true,
      delivery: true,
      reservations: false,
      kitchenStations: true,
      tableManagement: true,
    },

    // Step 3: Branding
    primaryColor: '#E53935',
    receiptHeader: 'TASSILI GRILL & BURGER\nAlger Centre\nTél: 0555 44 33 22',
    receiptFooter: 'Merci de votre fidélité ! Saha Ftourkoum !',
    paperWidth: '80mm' as '58mm' | '80mm',

    // Step 4: Branch
    branchName: 'Succursale Principale Alger',
    branchAddress: '14 Boulevard Zighout Youcef',
    branchPhone: '+213 555 44 33 22',
    workingHours: '11:00 - 00:00',

    // Step 5: Menu template
    menuTemplate: 'burger_grill', // 'burger_grill' | 'pizzeria' | 'traditional' | 'empty'

    // Step 6: Owner Admin
    ownerName: 'Sofiane Meziane',
    ownerEmail: 'sofiane@tassili-burger.dz',
    ownerPin: '1234',

    // Step 7: Plan
    planId: 'plan_pro',
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 8) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    await registerNewTenant({
      name: formData.name,
      businessType: formData.businessType,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      planId: formData.planId,
      services: formData.services,
      primaryColor: formData.primaryColor,
      paperWidth: formData.paperWidth,
      defaultLanguage: formData.defaultLanguage,
    });
    onClose();
  };

  const stepsList = [
    { num: 1, title: 'Identité', icon: <Building className="w-3.5 h-3.5" /> },
    { num: 2, title: 'Services', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { num: 3, title: 'Marque', icon: <Palette className="w-3.5 h-3.5" /> },
    { num: 4, title: 'Succursales', icon: <MapPin className="w-3.5 h-3.5" /> },
    { num: 5, title: 'Menu', icon: <Utensils className="w-3.5 h-3.5" /> },
    { num: 6, title: 'Personnel', icon: <UserPlus className="w-3.5 h-3.5" /> },
    { num: 7, title: 'Abonnement', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { num: 8, title: 'Validation', icon: <Rocket className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161618] border border-[#2D2D35] w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Wizard Header */}
        <div className="p-4 bg-[#1E1E22] border-b border-[#2D2D35] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#E53935] text-white">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white">{t.wizardTitle}</h2>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Étape {step} sur 8 : {stepsList[step - 1].title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#2A2A30] text-[#9CA3AF] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-[#121214] px-4 py-2 border-b border-[#2D2D35] flex items-center justify-between overflow-x-auto gap-1">
          {stepsList.map(s => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                step === s.num
                  ? 'bg-[#E53935] text-white'
                  : step > s.num
                  ? 'text-emerald-400 bg-emerald-950/40'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : s.icon}
              <span>{s.num}. {s.title}</span>
            </button>
          ))}
        </div>

        {/* Wizard Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-white text-sm">
          {/* STEP 1: BUSINESS PROFILE */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-white border-b border-[#2D2D35] pb-2">
                Informations Légales & Identité du Restaurant
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Nom du Restaurant / Société *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E53935]"
                    placeholder="ex: El Bahdja Burger"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Type d'Établissement</label>
                  <select
                    value={formData.businessType}
                    onChange={e => setFormData({ ...formData, businessType: e.target.value as BusinessType })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E53935]"
                  >
                    <option value="burger_restaurant">Burger Restaurant & Fast-Food</option>
                    <option value="pizzeria">Pizzeria & Trattoria</option>
                    <option value="traditional">Restaurant Traditionnel Algérien</option>
                    <option value="cafe">Café & Salon de Thé</option>
                    <option value="bakery">Boulangerie & Pâtisserie</option>
                    <option value="sandwich_shop">Sandwicherie & Tacos</option>
                    <option value="delivery_kitchen">Dark Kitchen / Livraison Uniquement</option>
                    <option value="other">Autre concept</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Numéro de Téléphone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E53935]"
                    placeholder="+213 550 00 00 00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Email Officiel</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E53935]"
                    placeholder="contact@restaurant.dz"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Adresse Complète</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E53935]"
                    placeholder="Rue, quartier, n°"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Ville & Wilaya</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E53935]"
                    placeholder="Alger, Oran, Constantine, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SERVICES */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-white border-b border-[#2D2D35] pb-2">
                Services & Canaux d'Exploitation Activés
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'dineIn', title: 'Sur Place (Dine-in)', desc: 'Service à table avec gestion de salle et additions.' },
                  { key: 'takeaway', title: 'À Emporter (Takeaway)', desc: 'Vente directe au comptoir et file d’attente.' },
                  { key: 'delivery', title: 'Service Livraison', desc: 'Gestion des coursiers et expéditions à domicile.' },
                  { key: 'kitchenStations', title: 'Cuisine KDS Multi-Postes', desc: 'Séparation automatique grill, friteuse, bar.' },
                  { key: 'tableManagement', title: 'Plan de Salle Visuel', desc: 'Plan interactif par zone (RDC, terrasse, VIP).' },
                  { key: 'reservations', title: 'Réservations de Tables', desc: 'Planning des réservations clients à l’avance.' },
                ].map(item => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1E1E22] border border-[#2D2D35] hover:border-[#E53935] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={(formData.services as any)[item.key]}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          services: { ...formData.services, [item.key]: e.target.checked },
                        })
                      }
                      className="mt-1 w-4 h-4 text-[#E53935] rounded focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-white text-xs">{item.title}</div>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: BRANDING & TICKET */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-white border-b border-[#2D2D35] pb-2">
                Identité Visuelle & Ticket de Caisse Thermique
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Couleur Principale d'Accent</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs">{formData.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Format de l'Imprimante Thermique</label>
                  <div className="flex gap-3">
                    {['80mm', '58mm'].map(width => (
                      <button
                        key={width}
                        type="button"
                        onClick={() => setFormData({ ...formData, paperWidth: width as any })}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                          formData.paperWidth === width
                            ? 'bg-[#E53935] text-white border-[#E53935]'
                            : 'bg-[#1E1E22] text-[#9CA3AF] border-[#2D2D35]'
                        }`}
                      >
                        Papier {width} {width === '80mm' ? '(Standard POS)' : '(Compact)'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">En-tête du Ticket</label>
                  <textarea
                    rows={3}
                    value={formData.receiptHeader}
                    onChange={e => setFormData({ ...formData, receiptHeader: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#E53935]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Pied de Page du Ticket</label>
                  <textarea
                    rows={3}
                    value={formData.receiptFooter}
                    onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#E53935]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BRANCHES */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-white border-b border-[#2D2D35] pb-2">
                Configuration de la Première Succursale (Point de Vente)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Nom de la Succursale</label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={e => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Horaires de Travail</label>
                  <input
                    type="text"
                    value={formData.workingHours}
                    onChange={e => setFormData({ ...formData, workingHours: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-3 py-2 text-white focus:outline-none"
                    placeholder="10:00 - 00:00"
                  />
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] italic">
                * Vous pourrez ajouter d'autres succursales à tout moment depuis les paramètres du compte.
              </p>
            </div>
          )}

          {/* STEP 5: MENU SETUP */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-white border-b border-[#2D2D35] pb-2">
                Modèle de Carte & Menu Initial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'burger_grill', title: 'Pack Fast-Food & Burgers', desc: '10 burgers, frites, sauces, sodas et combos pré-configurés avec fiches recettes.' },
                  { id: 'pizzeria', title: 'Pack Pizzeria & Pâtes', desc: 'Pizzas classiques, calzones, suppléments fromage et boissons.' },
                  { id: 'traditional', title: 'Pack Restaurant Traditionnel', desc: 'Couscous, tajines, grillades, soupes et salades traditionnelles.' },
                  { id: 'empty', title: 'Menu Vierge (Personnalisé)', desc: 'Démarrer avec une carte vierge et configurer manuellement vos articles.' },
                ].map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, menuTemplate: tpl.id })}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      formData.menuTemplate === tpl.id
                        ? 'bg-[#E53935]/10 border-[#E53935] text-white'
                        : 'bg-[#1E1E22] border-[#2D2D35] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{tpl.title}</div>
                    <p className="text-[11px] text-[#9CA3AF] mt-1">{tpl.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: STAFF SETUP */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-white border-b border-[#2D2D35] pb-2">
                Compte Propriétaire / Administrateur
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Nom et Prénom</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Email Administrateur</label>
                  <input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Code PIN Rapide (Caisse / POS)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.ownerPin}
                    onChange={e => setFormData({ ...formData, ownerPin: e.target.value })}
                    className="w-full bg-[#1E1E22] border border-[#2D2D35] rounded-lg px-3 py-2 text-white focus:outline-none font-mono text-center tracking-widest"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: SUBSCRIPTION */}
          {step === 7 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-white border-b border-[#2D2D35] pb-2">
                Choisissez votre Formule d'Abonnement (Essai Gratuit Inclus)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setFormData({ ...formData, planId: p.id })}
                    className={`cursor-pointer p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      formData.planId === p.id
                        ? 'bg-[#E53935]/15 border-[#E53935] shadow-lg shadow-red-950/30'
                        : 'bg-[#1E1E22] border-[#2D2D35] hover:border-[#3E3E48]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{p.name}</span>
                        {p.isPopular && (
                          <span className="bg-[#E53935] text-[10px] font-black px-1.5 py-0.5 rounded text-white uppercase">
                            Populaire
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xl font-black text-white">
                        {p.monthlyPrice.toLocaleString()} <span className="text-xs text-[#9CA3AF]">DA/mois</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                        {p.trialDays} jours d'essai sans engagement
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-2">{p.description}</p>
                      <ul className="mt-3 space-y-1 text-xs text-[#D1D5DB]">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="text-emerald-400">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: REVIEW & LAUNCH */}
          {step === 8 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-white border-b border-[#2D2D35] pb-2">
                Récapitulatif & Lancement du Nouveau Restaurant
              </h3>
              <div className="bg-[#1E1E22] p-4 rounded-xl border border-[#2D2D35] space-y-3 text-xs">
                <div className="flex justify-between border-b border-[#2D2D35] pb-2">
                  <span className="text-[#9CA3AF]">Restaurant :</span>
                  <span className="font-bold text-white">{formData.name} ({formData.city})</span>
                </div>
                <div className="flex justify-between border-b border-[#2D2D35] pb-2">
                  <span className="text-[#9CA3AF]">Téléphone & Contact :</span>
                  <span className="font-bold text-white">{formData.phone} / {formData.email}</span>
                </div>
                <div className="flex justify-between border-b border-[#2D2D35] pb-2">
                  <span className="text-[#9CA3AF]">Succursale initiale :</span>
                  <span className="font-bold text-white">{formData.branchName}</span>
                </div>
                <div className="flex justify-between border-b border-[#2D2D35] pb-2">
                  <span className="text-[#9CA3AF]">Services activés :</span>
                  <span className="font-bold text-emerald-400">
                    {Object.entries(formData.services)
                      .filter(([_, v]) => v)
                      .map(([k]) => k)
                      .join(', ')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#2D2D35] pb-2">
                  <span className="text-[#9CA3AF]">Formule choisie :</span>
                  <span className="font-bold text-[#E53935] uppercase">{formData.planId.replace('plan_', '')} (14 jours gratuits)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Administrateur principal :</span>
                  <span className="font-bold text-white">{formData.ownerName}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 bg-[#1E1E22] border-t border-[#2D2D35] flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border ${
              step === 1
                ? 'opacity-40 cursor-not-allowed border-transparent text-[#9CA3AF]'
                : 'bg-[#2A2A30] hover:bg-[#34343C] text-white border-[#3E3E48]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            {t.wizardBack}
          </button>

          {step < 8 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-lg transition-colors"
            >
              {t.wizardNext}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-6 py-2 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-colors"
            >
              <Rocket className="w-4 h-4" />
              {t.wizardComplete}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
