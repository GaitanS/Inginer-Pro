import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ViewType, Language } from '../types';
import { Loader2, Send, Sparkles, BookOpen, XCircle } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface RightPanelProps {
  activeView: ViewType;
  language: Language;
}

export const RightPanel: React.FC<RightPanelProps> = ({ activeView, language }) => {
  const [loading, setLoading] = useState(false);
  const [guideContent, setGuideContent] = useState<string>("");
  const [userQuery, setUserQuery] = useState("");
  const t = TRANSLATIONS[language];

  useEffect(() => {
    setGuideContent("");
    const fetchGuide = async () => {
      if (!process.env.API_KEY) {
        setGuideContent(getStaticGuide(activeView, language));
        return;
      }

      setLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `${t.aiRole} Briefly explain the purpose of the "${t[activeView]}" module in a manufacturing execution system context. Keep it under 100 words. Use bullet points. ${t.aiPromptLang}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        setGuideContent(response.text || "No content generated.");
      } catch (error) {
        console.error("Gemini Error:", error);
        setGuideContent(getStaticGuide(activeView, language));
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [activeView, language]);

  const handleAskAi = async () => {
    if (!userQuery.trim() || !process.env.API_KEY) return;

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Context: User is viewing the ${t[activeView]} tab in a manufacturing dashboard. 
       User Question: ${userQuery}
       Provide a helpful, professional answer related to industrial engineering. ${t.aiPromptLang}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setGuideContent(prev => prev + "\n\n**Q: " + userQuery + "**\n" + (response.text || ""));
      setUserQuery("");
    } catch (e) {
      setGuideContent(prev => prev + "\n\nError contacting AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-preh-dark-surface border-l border-gray-200 dark:border-preh-dark-border flex flex-col h-screen shadow-xl z-30 transition-colors duration-200">
      <div className="p-4 border-b border-gray-200 dark:border-preh-dark-border flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <BookOpen size={18} className="text-preh-petrol dark:text-preh-light-blue" />
          {t.guidesTitle}
        </h3>
      </div>

      <div className="flex-1 p-5 overflow-y-auto prose prose-sm max-w-none text-gray-600 dark:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-headings:text-gray-800 dark:prose-headings:text-white">
        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          {t.context}: <span className="text-preh-petrol dark:text-preh-light-blue">{t[activeView]}</span>
        </h4>

        {loading && !guideContent ? (
          <div className="flex items-center justify-center h-32 text-preh-petrol dark:text-preh-light-blue">
            <Loader2 className="animate-spin mr-2" /> {t.generating}
          </div>
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed text-sm">
            {guideContent}
          </div>
        )}
      </div>

      {/* AI Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-preh-dark-border bg-gray-50 dark:bg-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
          <Sparkles size={12} className="text-preh-petrol dark:text-preh-light-blue" />
          <span className="font-medium">{t.askAi}</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder={t.askPlaceholder}
            className="flex-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-preh-petrol placeholder-gray-400 dark:placeholder-gray-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
            disabled={!process.env.API_KEY}
          />
          <button
            onClick={handleAskAi}
            disabled={loading || !process.env.API_KEY}
            className="bg-preh-petrol text-white p-2 rounded-md hover:bg-preh-grey-blue disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        {!process.env.API_KEY && (
          <p className="text-[10px] text-red-500 dark:text-red-400 mt-2 flex items-center gap-1">
            <XCircle size={10} />
            {t.apiKeyRequired}
          </p>
        )}
      </div>
    </div>
  );
};

function getStaticGuide(view: ViewType, language: Language): string {
  const isRo = language === 'ro';
  switch (view) {
    case ViewType.PFMEA:
      return isRo
        ? "Analiza Modurilor de Defectare și a Efectelor (PFMEA) este un instrument analitic structurat utilizat de o organizație pentru a identifica și evalua potențialele defecțiuni ale unui proces."
        : "Process Failure Mode Effects Analysis (PFMEA) is a structured analytical tool used by an organization, business unit, or cross-functional team to identify and evaluate the potential failures of a process.";
    case ViewType.BOM:
      return isRo
        ? "O Listă de Materiale (BOM) este un inventar complet al materiilor prime, ansamblelor, subansamblelor, pieselor și componentelor, precum și cantitățile necesare pentru a fabrica un produs."
        : "A Bill of Materials (BOM) is a comprehensive inventory of the raw materials, assemblies, subassemblies, parts and components, as well as the quantities of each, needed to manufacture a product.";
    case ViewType.CAPACITY:
      return isRo
        ? "Planificarea capacității determină capacitatea de producție necesară unei organizații pentru a satisface cerințele în schimbare pentru produsele sale."
        : "Capacity planning determines the production capacity needed by an organization to meet changing demands for its products.";
    case ViewType.EQUIPMENT:
      return isRo
        ? "Câmpul 'Complet [%]' indică procentul de setări tehnice completate pentru stație. De exemplu, dacă sunt definite Stația, Proprietarul și Numărul EQ, progresul crește. 100% înseamnă că toate specificațiile tehnice (Putere, Aer etc.) sunt definite complet."
        : "The 'Completed [%]' field indicates the percentage of technical settings filled for the station. For example, if Station, Owner, and EQ Number are defined, progress increases. 100% means all technical specifications (Power, Air, etc.) are fully defined.";
    default:
      return isRo
        ? `Ghidurile detaliate și procedurile standard de operare pentru ${TRANSLATIONS[language][view]} vor apărea aici.`
        : `Detailed guides and standard operating procedures for ${TRANSLATIONS[language][view]} will appear here.`;
  }
}