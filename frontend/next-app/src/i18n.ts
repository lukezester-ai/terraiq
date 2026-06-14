import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        demo: "MVP Demo",
        workspace: "Workspace",
        plans: "Plans",
        admin: "Admin",
        request_demo: "Request Demo"
      },
      hero: {
        subtitle: "Strategic Operating System",
        title: "Terra",
        title_hl: "IQ",
        desc1: "The Intelligence Layer",
        desc2: "For Modern Agriculture",
        body: "Transform Data Into Decisions. TerraIQ combines data fabric, knowledge graph, agent mesh, digital twin and executive intelligence into one decision center.",
        btn_request: "Request Demo",
        btn_demo: "View MVP Demo"
      },
      platform: {
        kpi_title: "Executive Dashboard",
        title: "TerraIQ Executive Center",
        desc: "Core indicators for the current season. Investors should see business value first, not infrastructure noise.",
        status: "Decision layer online"
      },
      kpi: {
        expected_profit: "Expected Profit",
        expected_profit_desc: "current season",
        risk_index: "Risk Index",
        risk_index_desc: "low exposure",
        strategic_actions: "Strategic Actions",
        strategic_actions_desc: "ready for review",
        cash_flow: "Cash Flow",
        cash_flow_desc: "healthy"
      }
    }
  },
  bg: {
    translation: {
      nav: {
        demo: "Демо",
        workspace: "Портал",
        plans: "Абонаменти",
        admin: "Админ",
        request_demo: "Заявете Демо"
      },
      hero: {
        subtitle: "Стратегическа Оперативна Система",
        title: "Terra",
        title_hl: "IQ",
        desc1: "Интелигентният Слой",
        desc2: "За Модерното Земеделие",
        body: "Превърнете данните в решения. TerraIQ обединява бази данни, агенти с изкуствен интелект, дигитални двойници и управленска интелигентност в един център за решения.",
        btn_request: "Заявете Демо",
        btn_demo: "Вижте Демо"
      },
      platform: {
        kpi_title: "Контролен Панел",
        title: "TerraIQ Управленски Център",
        desc: "Ключови индикатори за текущия сезон. Инвеститорите трябва да виждат бизнес стойност, а не инфраструктурен шум.",
        status: "Системата за решения е онлайн"
      },
      kpi: {
        expected_profit: "Очаквана Печалба",
        expected_profit_desc: "текущ сезон",
        risk_index: "Индекс на Риска",
        risk_index_desc: "ниска експозиция",
        strategic_actions: "Стратегически Действия",
        strategic_actions_desc: "готови за преглед",
        cash_flow: "Паричен Поток",
        cash_flow_desc: "стабилен"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
