
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Check, X, Smartphone, Globe, CreditCard, Store, ShoppingBag, 
  Zap, Palette, User, Mail, Phone, Lock, Briefcase, Loader2, Send, 
  Timer, BarChart2, MessageCircle, MousePointerClick, Edit3, CheckCircle2, Info 
} from 'lucide-react';
import { userProjectsStore } from '../lib/userProjectsStore';
import { leadStore } from '../lib/leadStore'; // Import leadStore
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase-client';
import { useTranslation } from '../lib/i18nContext';
import PhoneInput from './PhoneInput'; // Import PhoneInput

interface ProjectWizardProps {
  onClose: () => void;
  onComplete: (requestId?: string) => void;
  isLeadMode?: boolean; // New Prop
  source?: string;      // New Prop
}

// Wizard Steps Data
const PLATFORMS = ['Website', 'App', 'Both'];
const LANGUAGES = ['Arabic', 'English', 'Both'];
const MARKETS = ['Kuwait', 'GCC', 'Arab World', 'Global'];
const SERVICE_MODELS = ['Direct to customer', 'Marketplace'];
const CLOSEST_APPS = ['Talabat', '4Sale', 'Sheeel', 'Careem', 'None'];

const INDUSTRIES = [
  'Food & Delivery',
  'Fashion & Clothing',
  'Pharmacy & Healthcare',
  'Pets & Animals',
  'Services',
  'Education',
  'Real Estate',
  'Travel & Tourism',
  'Finance',
  'Logistics & Shipping',
  'Other'
];

const PRESET_COLORS = [
  { hex: '#1DB7F0', name: 'Raiyansoft' },
  { hex: '#10B981', name: 'Teal' },
  { hex: '#FACC15', name: 'Gold' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#FFFFFF', name: 'White' }
];

const ProjectWizard: React.FC<ProjectWizardProps> = ({ onClose, onComplete, isLeadMode = false, source }) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const isAuthenticated = !!auth.currentUser;
  const { t, dir, language, setLanguage } = useTranslation();

  // Form State
  const [formData, setFormData] = useState({
    platforms: [] as string[],
    languages: [] as string[],
    markets: [] as string[],
    industry: '',
    industryOther: '',
    hasPayments: null as boolean | null,
    hasExistingBusiness: null as boolean | null,
    serviceModel: '',
    closestApp: '',
    name: '',
    brandColor: '#1DB7F0',
    description: '', // Generated later
    
    // Signup Data
    signupFirstName: '',
    signupLastName: '',
    signupPhone: '',
    signupEmail: '',
    signupPassword: '',
    signupConfirmPassword: ''
  });

  const [showCustomColor, setShowCustomColor] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Navigation Logic
  // 0: Intro, 1: Platforms, 2: Languages, 3: Markets, 4: Industry
  // 5: Payments, 6: Existing Biz, 7: Service Model, 8: Closest App
  // 9: Name, 10: Color, 11: Signup (or Contact Info), 12: Review

  const nextStep = () => {
    if (validateStep(step)) {
      setDirection(1);
      // Skip Signup/Contact Step (11) if authenticated AND not in lead mode (leads always need contact info if not auth, but maybe auth users also?)
      // If auth, user is creating project directly.
      if (step === 10 && isAuthenticated && !isLeadMode) {
        generateAndSetDescription();
        setStep(12);
      } else {
        if (step === 11) {
            // Finishing signup/contact step, generate description for review
            generateAndSetDescription();
        }
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    setDirection(-1);
    if (step === 12 && isAuthenticated && !isLeadMode) {
      setStep(10);
    } else {
      setStep(step - 1);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    setErrors([]);
    const newErrors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (currentStep) {
      case 1: if (formData.platforms.length === 0) newErrors.push(t('val.req_platform')); break;
      case 2: if (formData.languages.length === 0) newErrors.push(t('val.req_lang')); break;
      case 3: if (formData.markets.length === 0) newErrors.push(t('val.req_market')); break;
      case 4: 
        if (!formData.industry) newErrors.push(t('val.req_industry')); 
        if (formData.industry === 'Other' && !formData.industryOther?.trim()) newErrors.push(t('val.req_industry_other'));
        break;
      case 5: if (formData.hasPayments === null) newErrors.push(t('val.req_option')); break;
      case 6: if (formData.hasExistingBusiness === null) newErrors.push(t('val.req_option')); break;
      case 7: if (!formData.serviceModel) newErrors.push(t('val.req_service')); break;
      case 8: if (!formData.closestApp) newErrors.push(t('val.req_ref')); break;
      case 9: if (!formData.name.trim()) newErrors.push(t('val.req_name')); break;
      case 10: if (!formData.brandColor) newErrors.push(t('val.req_color')); break;
      case 11: // Signup OR Contact Validation
        if (isLeadMode) {
           if (!formData.signupFirstName) newErrors.push(t('val.req_firstname')); // Reuse firstname field for Name or First Name
           if (!formData.signupPhone) newErrors.push(t('val.req_phone'));
           // Email optional in lead mode
        } else if (!isAuthenticated) {
          if (!formData.signupFirstName) newErrors.push(t('val.req_firstname'));
          if (!formData.signupLastName) newErrors.push(t('val.req_lastname'));
          
          const signupEmailTrimmed = formData.signupEmail.trim();
          if (!signupEmailTrimmed || !emailRegex.test(signupEmailTrimmed)) {
            newErrors.push(t('val.req_email'));
          }

          // Phone is now optional for normal signup
          if (formData.signupPassword.length < 6) newErrors.push(t('val.pass_short'));
          if (formData.signupPassword !== formData.signupConfirmPassword) newErrors.push(t('val.pass_match'));
        }
        break;
      case 12: 
        if (!formData.name.trim()) newErrors.push(t('val.req_name'));
        if (!formData.description.trim()) newErrors.push(t('val.req_desc'));
        break;
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return false;
    }
    
    return true;
  };

  const generateAndSetDescription = () => {
    const parts = [];
    const industryKey = `industry.${formData.industry}`;
    // Get industry text in current language
    const industryText = formData.industry === 'Other' 
        ? (formData.industryOther || 'custom') 
        : t(industryKey);
    
    const serviceKey = `service.${formData.serviceModel}`;
    const serviceText = t(serviceKey);

    const platformTexts = formData.platforms.map(p => t(`platform.${p}`)).join(' & ');
    const langTexts = formData.languages.map(l => t(`lang.${l}`)).join(' & ');
    const marketTexts = formData.markets.map(m => t(`market.${m}`)).join(', ');

    if (dir === 'rtl') {
        // Arabic Generation
        parts.push(`منصة ${industryText} بنظام ${serviceText}`);
        if (formData.closestApp !== 'None') parts.push(`مشابهة لتطبيق ${formData.closestApp}`);
        parts.push(`تستهدف ${marketTexts}.`);
        parts.push(`متاحة على ${platformTexts}`);
        parts.push(`باللغات ${langTexts}.`);
        if (formData.hasPayments) parts.push("تشمل الدفع الإلكتروني.");
        if (formData.hasExistingBusiness) parts.push("تدعم نشاط تجاري قائم.");
        else parts.push("مشروع تجاري جديد.");
    } else {
        // English Generation
        parts.push(`A ${formData.serviceModel.toLowerCase()} ${industryText} platform`);
        if (formData.closestApp !== 'None') parts.push(`similar to ${formData.closestApp}`);
        parts.push(`targeting ${formData.markets.join(', ')}.`);
        parts.push(`Available on ${platformTexts}`);
        parts.push(`in ${langTexts}.`);
        if (formData.hasPayments) parts.push("Includes in-app payments.");
        if (formData.hasExistingBusiness) parts.push("Supports an existing business.");
        else parts.push("New business venture.");
    }

    setFormData(prev => ({ ...prev, description: parts.join(' ') }));
  };

  const handleCreate = async () => {
    if (!validateStep(12)) return;
    setIsLoading(true);
    setErrors([]);

    try {
      let requestId: string | undefined = undefined;
      
      if (isLeadMode) {
        // Lead Submission
        const leadPayload = {
            name: `${formData.signupFirstName} ${formData.signupLastName}`.trim(),
            phone: formData.signupPhone,
            email: formData.signupEmail?.trim() || undefined,
            source: source || 'direct',
            projectPayload: {
                name: formData.name,
                description: formData.description,
                platforms: formData.platforms,
                languages: formData.languages,
                markets: formData.markets,
                industry: formData.industry,
                industryOther: formData.industryOther,
                hasPayments: formData.hasPayments,
                hasExistingBusiness: formData.hasExistingBusiness,
                serviceModel: formData.serviceModel,
                closestApp: formData.closestApp,
                brandColor: formData.brandColor
            }
        };
        requestId = await leadStore.submitLead(leadPayload);
        
        // Meta Pixel Lead Event
        if (window.fbq) {
          window.fbq('track', 'Lead');
        }
      } else {
        // Normal Auth Creation
        let user = auth.currentUser;
        
        if (!user) {
            const signupEmailTrimmed = formData.signupEmail.trim();
            const userCredential = await createUserWithEmailAndPassword(auth, signupEmailTrimmed, formData.signupPassword);
            user = userCredential.user;
            await updateProfile(user, {
            displayName: `${formData.signupFirstName} ${formData.signupLastName}`
            });
        }
        
        const projRef = await userProjectsStore.addProject({
            name: formData.name,
            description: formData.description,
            ownerName: user.displayName || 'User',
            ownerEmail: user.email || '',
            ownerId: user.uid,
            estimatedPrice: null,
            estimatedDuration: null,
            status: 'pricing',
            projectUrl: null,
            platforms: formData.platforms,
            languages: formData.languages,
            markets: formData.markets,
            industry: formData.industry,
            industryOther: formData.industryOther,
            hasPayments: formData.hasPayments || false,
            hasExistingBusiness: formData.hasExistingBusiness || false,
            serviceModel: formData.serviceModel,
            closestApp: formData.closestApp,
            brandColor: formData.brandColor
        });
        // userProjectsStore.addProject currently returns nothing, so we leave it alone or adapt if needed
      }

      onComplete(requestId);
    } catch (e: any) {
      console.error(e);
      let msg = "Failed to create project.";
      if (e.code === 'auth/email-already-in-use') msg = t('auth.email_in_use');
      else if (e.message) msg = e.message;
      setErrors([msg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Inputs
  const toggleArray = (arr: string[], val: string, key: 'platforms' | 'languages' | 'markets') => {
    const newArr = arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val];
    setFormData({ ...formData, [key]: newArr });
  };

  const handleAutoSelection = (key: string, value: any, isArray = false) => {
    if (isArray) {
        setFormData(prev => ({ ...prev, [key]: [value] }));
    } else {
        setFormData(prev => ({ ...prev, [key]: value }));
    }
    setDirection(1);
    setTimeout(() => setStep(s => s + 1), 100);
  };

  const handleIndustrySelect = (ind: string) => {
    setFormData(prev => ({ ...prev, industry: ind }));
    if (ind !== 'Other') {
        setDirection(1);
        setTimeout(() => setStep(s => s + 1), 100);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Determine if Next button should be hidden for auto-advance steps
  const isNextHidden = () => {
    if ([1, 2, 3, 5, 6, 7, 8].includes(step)) return true;
    if (step === 4 && formData.industry !== 'Other') return true;
    return false;
  };

  // --- RENDERERS ---

  const renderIntro = () => (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-24">
       <div className="flex flex-col items-center text-center p-6 gap-6">
           {/* Icon */}
           <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/20 animate-pulse shrink-0">
             <Zap size={40} className="text-primary" />
           </div>

           {/* Headlines */}
           <div>
               <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{t('wizard.start_title')}</h2>
               <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                 {t('wizard.start_subtitle')}
               </p>
           </div>

           {/* Wrapper for tighter spacing */}
           <div className="w-full flex flex-col gap-3">
               {/* Feature Cards */}
               <div className="grid grid-cols-3 gap-3 w-full">
                  <div className="bg-slate-800/40 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center gap-2">
                     <Timer size={20} className="text-primary" />
                     <span className="text-[10px] font-bold text-slate-300 leading-tight">{t('wizard.feat_time')}</span>
                  </div>
                  <div className="bg-slate-800/40 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center gap-2">
                     <BarChart2 size={20} className="text-emerald-400" />
                     <span className="text-[10px] font-bold text-slate-300 leading-tight">{t('wizard.feat_analysis')}</span>
                  </div>
                  <div className="bg-slate-800/40 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center gap-2">
                     <MessageCircle size={20} className="text-blue-400" />
                     <span className="text-[10px] font-bold text-slate-300 leading-tight">{t('wizard.feat_reply')}</span>
                  </div>
               </div>

               {/* Steps Row */}
               <div className="flex items-center justify-between w-full px-8 relative">
                  {/* Connector Line */}
                  <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-800 -z-10" />
                  
                  <div className="flex flex-col items-center gap-2 bg-[#020617] px-2">
                     <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                        <MousePointerClick size={14} />
                     </div>
                     <span className="text-[10px] text-slate-500 font-medium">{t('wizard.step_1_label')}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-[#020617] px-2">
                     <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                        <Edit3 size={14} />
                     </div>
                     <span className="text-[10px] text-slate-500 font-medium">{t('wizard.step_2_label')}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-[#020617] px-2">
                     <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                        <CheckCircle2 size={14} />
                     </div>
                     <span className="text-[10px] text-slate-500 font-medium">{t('wizard.step_3_label')}</span>
                  </div>
               </div>
           </div>

           {/* Note */}
           <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl w-full text-start flex items-start gap-3">
             <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
             <div>
                <span className="text-amber-500 text-xs font-bold block mb-0.5">{t('wizard.start_note')}</span>
                <p className="text-amber-500/80 text-[10px] leading-relaxed">
                  {t('wizard.start_desc')}
                </p>
             </div>
           </div>
           
           <div className="w-full pt-2">
             <button onClick={nextStep} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all">
               {t('wizard.start_btn')}
             </button>
             <p className="text-[10px] text-slate-500 mt-2 font-medium">{t('wizard.no_commit')}</p>
           </div>
           
           {/* Spacer for bottom safety */}
           <div className="h-4" />
       </div>
    </div>
  );

  const renderSingleSelectAuto = (title: string, options: string[], selected: string[], key: 'platforms' | 'languages' | 'markets', prefix: string) => (
    <div className="flex flex-col h-full p-6 pt-10">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="space-y-3">
        {options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => handleAutoSelection(key, opt, true)}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary text-white'
                  : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="font-medium text-lg">{t(`${prefix}.${opt}`)}</span>
              {isSelected && <Check size={20} className="text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderIndustryStep = () => (
    <div className="flex flex-col h-full p-6 pt-10 overflow-y-auto no-scrollbar pb-32">
      <h2 className="text-2xl font-bold text-white mb-6">{t('wizard.step_industry')}</h2>
      <div className="grid grid-cols-2 gap-3">
        {INDUSTRIES.map(ind => {
           const isSelected = formData.industry === ind;
           return (
             <button
                key={ind}
                onClick={() => handleIndustrySelect(ind)}
                className={`p-4 rounded-xl border font-medium transition-all duration-200 text-start flex flex-col justify-between h-24 ${
                  isSelected 
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-slate-800 border-white/10 text-slate-400 hover:bg-slate-700'
                }`}
             >
                <span className="text-sm font-semibold leading-tight">{t(`industry.${ind}`)}</span>
                {isSelected && <div className="self-end bg-white/20 rounded-full p-1"><Check size={12} /></div>}
             </button>
           );
        })}
      </div>
      
      {formData.industry === 'Other' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">{t('wizard.specify')}</label>
          <input
            autoFocus
            type="text"
            value={formData.industryOther || ''}
            onChange={e => setFormData({ ...formData, industryOther: e.target.value })}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
            placeholder={t('wizard.specify_placeholder')}
          />
        </motion.div>
      )}
    </div>
  );

  const renderSingleChoiceAuto = (title: string, options: any[], selected: any, key: string, isBool = false, prefix?: string) => (
    <div className="flex flex-col h-full p-6 pt-10">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="space-y-3">
        {options.map((opt) => {
          const val = isBool ? opt.value : opt;
          const labelKey = isBool ? (val ? 'wizard.yes' : 'wizard.no') : (prefix ? `${prefix}.${opt}` : `ref.${opt}`);
          const label = t(labelKey);
          
          const isSelected = selected === val;
          return (
            <button
              key={label}
              onClick={() => handleAutoSelection(key, val, false)}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary text-white'
                  : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="font-medium text-lg">{label}</span>
              {isSelected && <Check size={20} className="text-primary" />}
            </button>
          )
        })}
      </div>
    </div>
  );

  const renderTextInput = (title: string, val: string, key: string, placeholderKey: string) => (
    <div className="flex flex-col h-full p-6 pt-10">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <input
        autoFocus
        type="text"
        value={val}
        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
        className="w-full bg-slate-800 border border-white/10 rounded-2xl px-6 py-4 text-xl text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
        placeholder={t(placeholderKey)}
      />
    </div>
  );

  const renderColorPicker = () => (
    <div className="flex flex-col h-full p-6 pt-10">
      <h2 className="text-2xl font-bold text-white mb-6">{t('wizard.step_color')}</h2>
      
      {/* Presets Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {PRESET_COLORS.map((color) => {
          const isSelected = formData.brandColor.toLowerCase() === color.hex.toLowerCase();
          return (
            <button
              key={color.hex}
              onClick={() => {
                setFormData({ ...formData, brandColor: color.hex });
                setShowCustomColor(false);
              }}
              className={`
                relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200
                ${isSelected 
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#020617] scale-105' 
                  : 'hover:scale-105 border border-white/10'
                }
              `}
              style={{ backgroundColor: color.hex }}
            >
               {isSelected && (
                 <div className={`bg-black/20 rounded-full p-1 ${color.hex.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'}`}>
                   <Check size={20} />
                 </div>
               )}
            </button>
          );
        })}
      </div>

      {/* Custom Color Toggle */}
      <div className="flex flex-col items-center w-full">
        <button
          onClick={() => setShowCustomColor(!showCustomColor)}
          className={`
            flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 rounded-xl border transition-all mb-4
            ${showCustomColor 
              ? 'bg-slate-800 border-primary text-primary' 
              : 'bg-slate-800/50 border-white/10 text-slate-400 hover:text-white'
            }
          `}
        >
            <Palette size={18} />
            <span>{t('wizard.custom_color')}</span>
        </button>

        {/* Custom Picker UI (Conditional) */}
        <AnimatePresence>
            {showCustomColor && (
                <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="w-full overflow-hidden flex flex-col items-center gap-4 bg-slate-800/30 p-4 rounded-2xl border border-white/5"
                >
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div 
                      className="w-20 h-20 rounded-full shadow-lg border-2 border-white/10 transition-colors duration-300"
                      style={{ backgroundColor: formData.brandColor }}
                    />
                    <div className="relative w-full">
                       <input 
                        type="color" 
                        value={formData.brandColor}
                        onChange={e => setFormData({...formData, brandColor: e.target.value})}
                        className="w-full h-12 rounded-xl cursor-pointer bg-slate-800 border border-white/10 p-1"
                      />
                    </div>
                    <input 
                       type="text"
                       value={formData.brandColor}
                       onChange={e => setFormData({...formData, brandColor: e.target.value})}
                       className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-center uppercase focus:border-primary focus:outline-none"
                    />
                  </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderSignupOrContact = () => {
    // If Lead Mode, show Contact Info form
    if (isLeadMode) {
        return (
            <div className="flex flex-col h-full p-6 overflow-y-auto no-scrollbar">
                <h2 className="text-2xl font-bold text-white mb-2">{t('lead_contact.title')}</h2>
                <p className="text-slate-400 text-sm mb-6">{t('lead_contact.subtitle')}</p>
                
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 ms-1">{t('lead_contact.fullname')}</label>
                        <div className="relative">
                            {/* Updated positioning logic */}
                            <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                            <input 
                                type="text" 
                                value={formData.signupFirstName} // Use firstName field for full name
                                onChange={e => setFormData({...formData, signupFirstName: e.target.value})} 
                                className="w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 ms-1">{t('lead_contact.phone')}</label>
                        <PhoneInput 
                            value={formData.signupPhone}
                            onChange={(val) => setFormData({...formData, signupPhone: val})}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 ms-1">{t('lead_contact.email_opt')}</label>
                        <div className="relative">
                            <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                            {/* Force LTR for email input */}
                            <input 
                                type="email" 
                                dir="ltr"
                                value={formData.signupEmail} 
                                onChange={e => setFormData({...formData, signupEmail: e.target.value})} 
                                className="w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none" 
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default Signup Form
    return (
    <div className="flex flex-col h-full p-6 overflow-y-auto no-scrollbar">
       <h2 className="text-2xl font-bold text-white mb-2">{t('auth.create_account')}</h2>
       <p className="text-slate-400 text-sm mb-6">{t('auth.signup_subtitle')}</p>
       
       <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-xs text-slate-400 ms-1">{t('auth.firstname')}</label>
               <input type="text" value={formData.signupFirstName} onChange={e => setFormData({...formData, signupFirstName: e.target.value})} className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-1">
               <label className="text-xs text-slate-400 ms-1">{t('auth.lastname')}</label>
               <input type="text" value={formData.signupLastName} onChange={e => setFormData({...formData, signupLastName: e.target.value})} className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div className="space-y-1">
             <label className="text-xs text-slate-400 ms-1">{t('auth.email')}</label>
             <div className="relative">
                <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input 
                  type="email" 
                  dir="ltr" 
                  value={formData.signupEmail} 
                  onChange={e => setFormData({...formData, signupEmail: e.target.value})} 
                  className={`w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border focus:outline-none transition-all ${
                    formData.signupEmail.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.signupEmail.trim()) 
                    ? 'border-red-500/50 focus:border-red-500' 
                    : 'border-white/10 focus:border-primary'
                  }`} 
                />
             </div>
             {formData.signupEmail.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.signupEmail.trim()) && (
               <p className="text-[10px] text-red-400 ms-1 mt-1">{t('val.req_email')}</p>
             )}
          </div>
          <div className="space-y-1">
             <label className="text-xs text-slate-400 ms-1">{t('auth.phone_opt')}</label>
             <PhoneInput 
                value={formData.signupPhone}
                onChange={(val) => setFormData({...formData, signupPhone: val})}
                required={false}
             />
          </div>
          <div className="space-y-1">
             <label className="text-xs text-slate-400 ms-1">{t('auth.password')}</label>
             <div className="relative">
                <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input type="password" dir="ltr" value={formData.signupPassword} onChange={e => setFormData({...formData, signupPassword: e.target.value})} className="w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none" />
             </div>
          </div>
          <div className="space-y-1">
             <label className="text-xs text-slate-400 ms-1">{t('auth.confirm_password')}</label>
             <div className="relative">
                <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input type="password" dir="ltr" value={formData.signupConfirmPassword} onChange={e => setFormData({...formData, signupConfirmPassword: e.target.value})} className="w-full bg-slate-800 rounded-xl ps-10 pe-4 py-3 text-white border border-white/10 focus:border-primary focus:outline-none" />
             </div>
          </div>
       </div>
    </div>
  );
  };

  const renderReview = () => (
    <div className="flex flex-col h-full p-4 overflow-y-auto no-scrollbar pb-32">
      <h2 className="text-2xl font-bold text-white mb-1">{t('wizard.review_title')}</h2>
      <p className="text-slate-400 text-sm mb-6">{t('wizard.review_desc')}</p>
      
      <div className="space-y-6">
        {/* Essentials */}
        <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">{t('wizard.essentials')}</h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.step_name')}</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none transition-colors"/>
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.desc_label')}</label>
             <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-24 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none resize-none text-sm leading-relaxed transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.step_industry')}</label>
            <div className="grid grid-cols-1 gap-2">
              <select value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none appearance-none">
                <option value="" disabled>{t('wizard.select_industry')}</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{t(`industry.${ind}`)}</option>)}
              </select>
              {formData.industry === 'Other' && (
                <input type="text" value={formData.industryOther} onChange={e => setFormData({...formData, industryOther: e.target.value})} placeholder={t('wizard.specify')} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none transition-colors"/>
              )}
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">{t('wizard.config')}</h3>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">{t('wizard.step_platforms')}</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setFormData({...formData, platforms: [p]})} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${formData.platforms.includes(p) ? 'bg-primary/20 text-primary border-primary/30' : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'}`}>{t(`platform.${p}`)}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">{t('wizard.step_languages')}</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => (
                <button key={l} onClick={() => setFormData({...formData, languages: [l]})} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${formData.languages.includes(l) ? 'bg-primary/20 text-primary border-primary/30' : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'}`}>{t(`lang.${l}`)}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">{t('wizard.step_markets')}</label>
            <div className="flex flex-wrap gap-2">
              {MARKETS.map(m => (
                <button key={m} onClick={() => toggleArray(formData.markets, m, 'markets')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${formData.markets.includes(m) ? 'bg-primary/20 text-primary border-primary/30' : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'}`}>{t(`market.${m}`)}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Business Logic */}
        <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">{t('wizard.biz_logic')}</h3>
          <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.step_service')}</label>
             <select value={formData.serviceModel} onChange={e => setFormData({...formData, serviceModel: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none appearance-none">
                <option value="" disabled>{t('wizard.select_option')}</option>
                {SERVICE_MODELS.map(m => <option key={m} value={m}>{t(`service.${m}`)}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.step_ref')}</label>
             <select value={formData.closestApp} onChange={e => setFormData({...formData, closestApp: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none appearance-none">
                <option value="" disabled>{t('wizard.select_option')}</option>
                {CLOSEST_APPS.map(app => <option key={app} value={app}>{t(`ref.${app}`)}</option>)}
             </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">{t('wizard.step_payments')}</label>
                <div className="flex rounded-lg overflow-hidden border border-white/10">
                   <button onClick={() => setFormData({...formData, hasPayments: true})} className={`flex-1 py-2 text-xs font-medium transition-colors ${formData.hasPayments ? 'bg-primary text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>{t('wizard.yes')}</button>
                   <div className="w-px bg-white/10"></div>
                   <button onClick={() => setFormData({...formData, hasPayments: false})} className={`flex-1 py-2 text-xs font-medium transition-colors ${!formData.hasPayments ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>{t('wizard.no')}</button>
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">{t('wizard.step_existing_biz')}</label>
                <div className="flex rounded-lg overflow-hidden border border-white/10">
                   <button onClick={() => setFormData({...formData, hasExistingBusiness: true})} className={`flex-1 py-2 text-xs font-medium transition-colors ${formData.hasExistingBusiness ? 'bg-primary text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>{t('wizard.yes')}</button>
                   <div className="w-px bg-white/10"></div>
                   <button onClick={() => setFormData({...formData, hasExistingBusiness: false})} className={`flex-1 py-2 text-xs font-medium transition-colors ${!formData.hasExistingBusiness ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>{t('wizard.no')}</button>
                </div>
             </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">{t('wizard.branding')}</h3>
          <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">{t('wizard.step_color')}</label>
             <div className="flex gap-3 items-center">
                <input type="color" value={formData.brandColor} onChange={e => setFormData({...formData, brandColor: e.target.value})} className="h-10 w-14 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0.5" />
                <input type="text" value={formData.brandColor} onChange={e => setFormData({...formData, brandColor: e.target.value})} className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none uppercase font-mono transition-colors" />
             </div>
             <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pt-1">
               {PRESET_COLORS.map(c => (
                 <button key={c.hex} onClick={() => setFormData({...formData, brandColor: c.hex})} className={`w-6 h-6 rounded-full border border-white/10 shrink-0 ${formData.brandColor.toLowerCase() === c.hex.toLowerCase() ? 'ring-2 ring-primary ring-offset-1 ring-offset-slate-900' : ''}`} style={{ backgroundColor: c.hex }} />
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main Render Switch
  const renderStep = () => {
    switch (step) {
      case 0: return renderIntro();
      case 1: return renderSingleSelectAuto(t('wizard.step_platforms'), PLATFORMS, formData.platforms, 'platforms', 'platform');
      case 2: return renderSingleSelectAuto(t('wizard.step_languages'), LANGUAGES, formData.languages, 'languages', 'lang');
      case 3: return renderSingleSelectAuto(t('wizard.step_markets'), MARKETS, formData.markets, 'markets', 'market');
      case 4: return renderIndustryStep();
      case 5: return renderSingleChoiceAuto(t('wizard.step_payments'), [{label:t('wizard.yes'), value: true}, {label: t('wizard.no'), value: false}], formData.hasPayments, 'hasPayments', true);
      case 6: return renderSingleChoiceAuto(t('wizard.step_existing_biz'), [{label:t('wizard.yes'), value: true}, {label: t('wizard.no'), value: false}], formData.hasExistingBusiness, 'hasExistingBusiness', true);
      case 7: return renderSingleChoiceAuto(t('wizard.step_service'), SERVICE_MODELS, formData.serviceModel, 'serviceModel', false, 'service');
      case 8: return renderSingleChoiceAuto(t('wizard.step_ref'), CLOSEST_APPS, formData.closestApp, 'closestApp');
      case 9: return renderTextInput(t('wizard.step_name'), formData.name, 'name', 'wizard.name_placeholder');
      case 10: return renderColorPicker();
      case 11: return renderSignupOrContact();
      case 12: return renderReview();
      default: return null;
    }
  };

  const nextButtonHidden = isNextHidden();

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start md:items-center bg-[#020617] md:bg-black/60 md:backdrop-blur-sm" dir={dir}>
      {/* Mobile-width Container */}
      <div className="w-full max-w-[430px] h-full bg-[#020617] flex flex-col relative shadow-2xl overflow-hidden md:border md:border-white/5">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0f172a]">
          <button onClick={step === 0 ? onClose : prevStep} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            {step === 0 ? <X size={24} /> : (dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />)}
          </button>
          <div className="flex space-x-1.5 rtl:space-x-reverse">
            {Array.from({ length: isAuthenticated && !isLeadMode ? 12 : 13 }).map((_, i) => (
               <div 
                 key={i} 
                 className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-slate-800'}`}
               />
            ))}
          </div>
          {/* Language Toggle or Spacer */}
          <div className="min-w-[40px] flex justify-end">
            {isLeadMode ? (
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="text-xs font-bold text-primary hover:text-white transition-colors border border-primary/30 rounded-lg px-3 py-1.5 bg-primary/10"
              >
                {language === 'en' ? 'عربي' : 'English'}
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ x: direction > 0 ? (dir === 'rtl' ? -300 : 300) : (dir === 'rtl' ? 300 : -300), opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? (dir === 'rtl' ? 300 : -300) : (dir === 'rtl' ? -300 : 300), opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 w-full h-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer / Controls */}
        {step !== 0 && (
        <div className={`p-6 pb-28 border-t border-white/5 bg-[#0f172a] z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.2)] transition-all duration-300 ${nextButtonHidden ? 'opacity-0 pointer-events-none absolute bottom-0 w-full' : 'opacity-100'}`}>
          
          {/* Error Message */}
          {errors.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center"
            >
              {errors[0]}
            </motion.div>
          )}

          <button 
            onClick={step === 12 ? handleCreate : nextStep}
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                 <span>{step === 12 ? (isLeadMode ? t('lead_contact.submit_btn') : (isAuthenticated ? t('wizard.create_btn') : t('wizard.create_account_project'))) : step === 11 ? (isLeadMode ? t('lead_contact.review_btn') : t('wizard.create_account_only')) : t('wizard.next')}</span>
                 {step !== 12 && (dir === 'rtl' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />)}
              </>
            )}
          </button>
        </div>
        )}
      </div>
    </div>
  );
};

export default ProjectWizard;
