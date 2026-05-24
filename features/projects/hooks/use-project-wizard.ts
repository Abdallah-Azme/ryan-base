import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-client';
import { useTranslation } from '@/lib/i18nContext';
import { userProjectsStore } from '@/lib/userProjectsStore';
import { leadStore } from '@/lib/leadStore';

export const PLATFORMS = ['Website', 'App', 'Both'];
export const LANGUAGES = ['Arabic', 'English', 'Both'];
export const MARKETS = ['Kuwait', 'GCC', 'Arab World', 'Global'];
export const SERVICE_MODELS = ['Direct to customer', 'Marketplace'];
export const CLOSEST_APPS = ['Talabat', '4Sale', 'Sheeel', 'Careem', 'None'];

export const INDUSTRIES = [
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
  'Other',
];

export const PRESET_COLORS = [
  { hex: '#1DB7F0', name: 'Raiyansoft' },
  { hex: '#10B981', name: 'Teal' },
  { hex: '#FACC15', name: 'Gold' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#FFFFFF', name: 'White' },
];

export function useProjectWizard({
  onClose,
  onComplete,
  isLeadMode = false,
  source,
}: {
  onClose: () => void;
  onComplete: (requestId?: string) => void;
  isLeadMode?: boolean;
  source?: string;
}) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const isAuthenticated = !!auth.currentUser;
  const { t, dir, language, setLanguage } = useTranslation();

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
    description: '',

    signupFirstName: '',
    signupLastName: '',
    signupPhone: '',
    signupEmail: '',
    signupPassword: '',
    signupConfirmPassword: '',
  });

  const [showCustomColor, setShowCustomColor] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectTypes, setProjectTypes] = useState<string[]>(INDUSTRIES);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'project_types'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activeTypes = snapshot.docs
          .map((snap) => snap.data())
          .filter((type) => type.active !== false)
          .map((type) => type.name)
          .filter(Boolean);
        setProjectTypes(activeTypes.length ? [...activeTypes, 'Other'] : INDUSTRIES);
      },
      () => setProjectTypes(INDUSTRIES)
    );
    return () => unsubscribe();
  }, []);

  const generateAndSetDescription = () => {
    const parts: string[] = [];
    const industryKey = `industry.${formData.industry}`;
    const industryText = formData.industry === 'Other' ? formData.industryOther || 'custom' : t(industryKey);
    const serviceKey = `service.${formData.serviceModel}`;
    const serviceText = t(serviceKey);

    const platformTexts = formData.platforms.map((p) => t(`platform.${p}`)).join(' & ');
    const langTexts = formData.languages.map((l) => t(`lang.${l}`)).join(' & ');
    const marketTexts = formData.markets.map((m) => t(`market.${m}`)).join(', ');

    if (dir === 'rtl') {
      parts.push(`منصة ${industryText} بنظام ${serviceText}`);
      if (formData.closestApp !== 'None') parts.push(`مشابهة لتطبيق ${formData.closestApp}`);
      parts.push(`تستهدف ${marketTexts}.`);
      parts.push(`متاحة على ${platformTexts}`);
      parts.push(`باللغات ${langTexts}.`);
      if (formData.hasPayments) parts.push('تشمل الدفع الإلكتروني.');
      if (formData.hasExistingBusiness) parts.push('تدعم نشاط تجاري قائم.');
      else parts.push('مشروع تجاري جديد.');
    } else {
      parts.push(`A ${formData.serviceModel.toLowerCase()} ${industryText} platform`);
      if (formData.closestApp !== 'None') parts.push(`similar to ${formData.closestApp}`);
      parts.push(`targeting ${formData.markets.join(', ')}.`);
      parts.push(`Available on ${platformTexts}`);
      parts.push(`in ${langTexts}.`);
      if (formData.hasPayments) parts.push('Includes in-app payments.');
      if (formData.hasExistingBusiness) parts.push('Supports an existing business.');
      else parts.push('New business venture.');
    }

    setFormData((prev) => ({ ...prev, description: parts.join(' ') }));
  };

  const validateStep = (currentStep: number): boolean => {
    setErrors([]);
    const newErrors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (currentStep) {
      case 1:
        if (formData.platforms.length === 0) newErrors.push(t('val.req_platform'));
        break;
      case 2:
        if (formData.languages.length === 0) newErrors.push(t('val.req_lang'));
        break;
      case 3:
        if (formData.markets.length === 0) newErrors.push(t('val.req_market'));
        break;
      case 4:
        if (!formData.industry) newErrors.push(t('val.req_industry'));
        if (formData.industry === 'Other' && !formData.industryOther?.trim())
          newErrors.push(t('val.req_industry_other'));
        break;
      case 5:
        if (formData.hasPayments === null) newErrors.push(t('val.req_option'));
        break;
      case 6:
        if (formData.hasExistingBusiness === null) newErrors.push(t('val.req_option'));
        break;
      case 7:
        if (!formData.serviceModel) newErrors.push(t('val.req_service'));
        break;
      case 8:
        if (!formData.closestApp) newErrors.push(t('val.req_ref'));
        break;
      case 9:
        if (!formData.name.trim()) newErrors.push(t('val.req_name'));
        break;
      case 10:
        if (!formData.brandColor) newErrors.push(t('val.req_color'));
        break;
      case 11:
        if (isLeadMode) {
          if (!formData.signupFirstName) newErrors.push(t('val.req_firstname'));
          if (!formData.signupPhone) newErrors.push(t('val.req_phone'));
        } else if (!isAuthenticated) {
          if (!formData.signupFirstName) newErrors.push(t('val.req_firstname'));
          if (!formData.signupLastName) newErrors.push(t('val.req_lastname'));

          const signupEmailTrimmed = formData.signupEmail.trim();
          if (!signupEmailTrimmed || !emailRegex.test(signupEmailTrimmed)) {
            newErrors.push(t('val.req_email'));
          }

          if (formData.signupPassword.length < 6) newErrors.push(t('val.pass_short'));
          if (formData.signupPassword !== formData.signupConfirmPassword)
            newErrors.push(t('val.pass_match'));
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

  const nextStep = () => {
    if (validateStep(step)) {
      setDirection(1);
      if (step === 10 && isAuthenticated && !isLeadMode) {
        generateAndSetDescription();
        setStep(12);
      } else {
        if (step === 11) {
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

  const handleCreate = async () => {
    if (!validateStep(12)) return;
    setIsLoading(true);
    setErrors([]);

    try {
      let requestId: string | undefined = undefined;

      if (isLeadMode) {
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
            brandColor: formData.brandColor,
          },
        };
        requestId = await leadStore.submitLead(leadPayload);

        if (window.fbq) {
          window.fbq('track', 'Lead');
        }
      } else {
        let user = auth.currentUser;

        if (!user) {
          const signupEmailTrimmed = formData.signupEmail.trim();
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            signupEmailTrimmed,
            formData.signupPassword
          );
          user = userCredential.user;
          await updateProfile(user, {
            displayName: `${formData.signupFirstName} ${formData.signupLastName}`,
          });
        }

        await userProjectsStore.addProject({
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
          brandColor: formData.brandColor,
        });
      }

      onComplete(requestId);
    } catch (e: any) {
      console.error(e);
      let msg = 'Failed to create project.';
      if (e.code === 'auth/email-already-in-use') msg = t('auth.email_in_use');
      else if (e.message) msg = e.message;
      setErrors([msg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArray = (arr: string[], val: string, key: 'platforms' | 'languages' | 'markets') => {
    const newArr = arr.includes(val) ? arr.filter((i) => i !== val) : [...arr, val];
    setFormData((prev) => ({ ...prev, [key]: newArr }));
  };

  const handleAutoSelection = (key: string, value: any, isArray = false) => {
    if (isArray) {
      setFormData((prev) => ({ ...prev, [key]: [value] }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
    setDirection(1);
    setTimeout(() => setStep((s) => s + 1), 100);
  };

  const handleIndustrySelect = (ind: string) => {
    setFormData((prev) => ({ ...prev, industry: ind }));
    if (ind !== 'Other') {
      setDirection(1);
      setTimeout(() => setStep((s) => s + 1), 100);
    }
  };

  const isNextHidden = () => {
    if ([1, 2, 3, 5, 6, 7, 8].includes(step)) return true;
    if (step === 4 && formData.industry !== 'Other') return true;
    return false;
  };

  return {
    step,
    direction,
    isAuthenticated,
    formData,
    setFormData,
    showCustomColor,
    setShowCustomColor,
    errors,
    isLoading,
    projectTypes,
    nextStep,
    prevStep,
    handleCreate,
    toggleArray,
    handleAutoSelection,
    handleIndustrySelect,
    isNextHidden,
    t,
    dir,
    language,
    setLanguage,
  };
}
