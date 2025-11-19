import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ViewType, Language } from '../types';
import { Loader2, Send, Sparkles, BookOpen } from 'lucide-react';
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
  
  // Context-aware initial message based on active tab
  useEffect(() => {
    setGuideContent(""); // Clear previous content
    const fetchGuide = async () => {
       // Only simulate initial fetch if we have an API key, otherwise show static
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
         setGuideContent(getStaticGuide(activeView, language)); // Fallback
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
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-screen shadow-sm">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <BookOpen size={18} />
          {t.guidesTitle}
        </h3>
      </div>

      <div className="flex-1 p-4 overflow-y-auto prose prose-sm max-w-none text-gray-600">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          {t.context}: {t[activeView]}
        </h4>
        
        {loading && !guideContent ? (
          <div className="flex items-center justify-center h-20 text-blue-500">
            <Loader2 className="animate-spin mr-2" /> {t.generating}
          </div>
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed">
             {guideContent}
          </div>
        )}
      </div>

      {/* AI Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <Sparkles size={12} className="text-purple-500" />
          <span>{t.askAi}</span>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder={t.askPlaceholder}
            className="flex-1 text-sm border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
            disabled={!process.env.API_KEY}
          />
          <button 
            onClick={handleAskAi}
            disabled={loading || !process.env.API_KEY}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        {!process.env.API_KEY && (
          <p className="text-[10px] text-red-400 mt-1">{t.apiKeyRequired}</p>
        )}
      </div>
    </div>
  );
};

// Fallback content if no API key
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
    default:
      return isRo
        ? `Ghidurile detaliate și procedurile standard de operare pentru ${TRANSLATIONS[language][view]} vor apărea aici.`
        : `Detailed guides and standard operating procedures for ${TRANSLATIONS[language][view]} will appear here.`;
  }
}