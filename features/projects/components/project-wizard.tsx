import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  PLATFORMS,
  LANGUAGES,
  MARKETS,
  INDUSTRIES,
  SERVICE_MODELS,
  CLOSEST_APPS,
  PRESET_COLORS,
  useProjectWizard,
} from '../hooks/use-project-wizard';
import WizardShell from './wizard-shell';
import WizardIntro from './wizard-intro';
import WizardSingleSelect from './wizard-single-select';
import WizardIndustryStep from './wizard-industry-step';
import WizardYesNo from './wizard-yes-no';
import WizardServiceModel from './wizard-service-model';
import WizardReferenceApp from './wizard-reference-app';
import WizardNameStep from './wizard-name-step';
import WizardColorPicker from './wizard-color-picker';
import WizardReview from './wizard-review';
import LeadContactForm from '@/features/auth/components/lead-contact-form';
import SignupForm from '@/features/auth/components/signup-form';

interface ProjectWizardProps {
  onClose: () => void;
  onComplete: (requestId?: string) => void;
  isLeadMode?: boolean;
  source?: string;
}

export default function ProjectWizard({
  onClose,
  onComplete,
  isLeadMode = false,
  source,
}: ProjectWizardProps) {
  const {
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
  } = useProjectWizard({ onClose, onComplete, isLeadMode, source });

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <WizardIntro t={t} onStart={nextStep} />;
      case 1:
        return (
          <WizardSingleSelect
            title={t('wizard.step_platforms')}
            options={PLATFORMS}
            selected={formData.platforms}
            t={t}
            prefix="platform"
            onSelect={(opt) => handleAutoSelection('platforms', opt, true)}
          />
        );
      case 2:
        return (
          <WizardSingleSelect
            title={t('wizard.step_languages')}
            options={LANGUAGES}
            selected={formData.languages}
            t={t}
            prefix="lang"
            onSelect={(opt) => handleAutoSelection('languages', opt, true)}
          />
        );
      case 3:
        return (
          <WizardSingleSelect
            title={t('wizard.step_markets')}
            options={MARKETS}
            selected={formData.markets}
            t={t}
            prefix="market"
            onSelect={(opt) => handleAutoSelection('markets', opt, true)}
          />
        );
      case 4:
        return (
          <WizardIndustryStep
            industries={projectTypes}
            selectedIndustry={formData.industry}
            industryOther={formData.industryOther}
            t={t}
            onSelectIndustry={handleIndustrySelect}
            onChangeOther={(val) => setFormData((prev) => ({ ...prev, industryOther: val }))}
          />
        );
      case 5:
        return (
          <WizardYesNo
            title={t('wizard.step_payments')}
            selected={formData.hasPayments}
            t={t}
            onSelect={(val) => handleAutoSelection('hasPayments', val, false)}
          />
        );
      case 6:
        return (
          <WizardYesNo
            title={t('wizard.step_existing_biz')}
            selected={formData.hasExistingBusiness}
            t={t}
            onSelect={(val) => handleAutoSelection('hasExistingBusiness', val, false)}
          />
        );
      case 7:
        return (
          <WizardServiceModel
            serviceModels={SERVICE_MODELS}
            selectedModel={formData.serviceModel}
            t={t}
            onSelect={(val) => handleAutoSelection('serviceModel', val, false)}
          />
        );
      case 8:
        return (
          <WizardReferenceApp
            closestApps={CLOSEST_APPS}
            selectedApp={formData.closestApp}
            t={t}
            onSelect={(val) => handleAutoSelection('closestApp', val, false)}
          />
        );
      case 9:
        return (
          <WizardNameStep
            name={formData.name}
            t={t}
            onChange={(val) => setFormData((prev) => ({ ...prev, name: val }))}
          />
        );
      case 10:
        return (
          <WizardColorPicker
            presetColors={PRESET_COLORS}
            brandColor={formData.brandColor}
            showCustomColor={showCustomColor}
            t={t}
            onSelectPreset={(hex) => {
              setFormData((prev) => ({ ...prev, brandColor: hex }));
              setShowCustomColor(false);
            }}
            onToggleCustom={() => setShowCustomColor(!showCustomColor)}
            onChangeCustom={(val) => setFormData((prev) => ({ ...prev, brandColor: val }))}
          />
        );
      case 11:
        if (isLeadMode) {
          return (
            <LeadContactForm
              formData={{
                firstName: formData.signupFirstName,
                phone: formData.signupPhone,
                email: formData.signupEmail,
              }}
              onChange={(key, val) =>
                setFormData((prev) => ({
                  ...prev,
                  [key === 'firstName' ? 'signupFirstName' : key === 'phone' ? 'signupPhone' : 'signupEmail']: val,
                }))
              }
            />
          );
        }
        return (
          <div className="p-6 overflow-y-auto h-full pb-24">
            <h2 className="text-2xl font-bold text-white mb-2">{t('auth.create_account')}</h2>
            <p className="text-slate-400 text-sm mb-6">{t('auth.signup_subtitle')}</p>
            <SignupForm
              defaultValues={{
                firstName: formData.signupFirstName,
                lastName: formData.signupLastName,
                phone: formData.signupPhone,
                email: formData.signupEmail,
                password: formData.signupPassword,
                confirmPassword: formData.signupConfirmPassword,
                agreed: true,
              }}
              loading={false}
              onSubmit={(data) => {
                setFormData((prev) => ({
                  ...prev,
                  signupFirstName: data.firstName,
                  signupLastName: data.lastName,
                  signupPhone: data.phone || '',
                  signupEmail: data.email,
                  signupPassword: data.password,
                  signupConfirmPassword: data.confirmPassword,
                }));
                nextStep();
              }}
            />
          </div>
        );
      case 12:
        return (
          <WizardReview
            formData={formData}
            setFormData={setFormData}
            platformsList={PLATFORMS}
            languagesList={LANGUAGES}
            marketsList={MARKETS}
            industriesList={INDUSTRIES}
            serviceModelsList={SERVICE_MODELS}
            closestAppsList={CLOSEST_APPS}
            presetColorsList={PRESET_COLORS}
            t={t}
            toggleArray={toggleArray}
          />
        );
      default:
        return null;
    }
  };

  return (
    <WizardShell
      step={step}
      direction={direction}
      totalSteps={isAuthenticated && !isLeadMode ? 12 : 13}
      isLoading={isLoading}
      errors={errors}
      nextButtonHidden={isNextHidden()}
      isLeadMode={isLeadMode}
      isAuthenticated={isAuthenticated}
      dir={dir}
      language={language}
      setLanguage={setLanguage}
      t={t}
      onClose={onClose}
      onPrev={prevStep}
      onNext={step === 12 ? handleCreate : nextStep}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{
            x: direction > 0 ? (dir === 'rtl' ? -300 : 300) : dir === 'rtl' ? 300 : -300,
            opacity: 0,
          }}
          animate={{ x: 0, opacity: 1 }}
          exit={{
            x: direction > 0 ? (dir === 'rtl' ? 300 : -300) : dir === 'rtl' ? -300 : 300,
            opacity: 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute inset-0 w-full h-full"
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
    </WizardShell>
  );
}
