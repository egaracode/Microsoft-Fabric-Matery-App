import { GoogleGenAI, Type } from "@google/genai";
import { CourseContent, DiagnosisQuestion, UserLevel } from "../types";

const SYSTEM_INSTRUCTION = `
Actuarás como "Fabric DevOps Expert" (MentorAI), un consultor senior y mentor experto en la arquitectura de datos moderna de Microsoft Fabric, Power BI y la implementación de prácticas CI/CD (Azure DevOps, Visual Studio Code, PowerShell).
Tu rol también incluye ser el "Arquitecto de la Experiencia", definiendo la UI/UX de la aplicación final.
Tu tono es profesional, técnico, didáctico y directo al punto.
Todo el contenido generado y la interacción deben ser siempre en español.
Prioriza la accesibilidad, la claridad y el diseño minimalista.
HERRAMIENTAS DE REFERENCIA: Windows, Power BI, Microsoft Fabric, Azure DevOps, Azure, Visual Studio Code, Power Shell, Bloc de Notas y Excel.
RESTRICCIÓN CRÍTICA: NO debes mostrar ni hacer referencia a URLs o webs verificadas. Usa referencias simuladas.
`;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDiagnosisQuestions = async (): Promise<DiagnosisQuestion[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Genera 3 preguntas técnicas de selección múltiple para evaluar el nivel de experiencia de un usuario en el ecosistema Microsoft Fabric, Power BI y DevOps.
    Las preguntas deben cubrir conceptos generales pero claves.
    Devuelve un JSON array de objetos con: id (number), question (string), options (array of strings).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "question", "options"]
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating diagnosis:", error);
    throw error;
  }
};

export const evaluateUserLevel = async (answers: {question: string, answer: string}[]): Promise<UserLevel> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Basado en las siguientes respuestas del usuario a preguntas técnicas, determina su nivel (Principiante, Intermedio, Avanzado).
    Respuestas: ${JSON.stringify(answers)}
    Devuelve SOLO un JSON con la propiedad "level".
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, enum: ["Principiante", "Intermedio", "Avanzado"] }
          }
        },
      },
    });

    const text = response.text;
    if (!text) return "Principiante";
    const json = JSON.parse(text);
    return json.level as UserLevel;
  } catch (error) {
    console.error("Error evaluating level:", error);
    return "Principiante";
  }
};

export const generatePillars = async (topic: string, level: UserLevel): Promise<string[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Tema central: "${topic}".
    Nivel del usuario: "${level}".
    Genera 10 "Temas Pilar" amplios y estratégicos relacionados con el ecosistema Microsoft Fabric/Power BI/DevOps.
    Deben enfocarse en conceptos técnicos clave, componentes de la suite o etapas del ciclo de vida.
    Devuelve SOLO un JSON array de strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating pillars:", error);
    throw error;
  }
};

export const generateVariations = async (pillar: string, level: UserLevel): Promise<string[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Tema Pilar seleccionado: "${pillar}".
    Nivel del usuario: "${level}".
    Genera 10 "Variaciones de Lección" muy específicas y diferenciadas.
    Deben centrarse en escenarios de uso concretos, herramientas específicas y casos prácticos.
    Devuelve SOLO un JSON array de strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating variations:", error);
    throw error;
  }
};

export const generateCourse = async (variation: string, level: UserLevel): Promise<CourseContent> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Genera un curso técnico completo basado en la lección: "${variation}".
    Nivel del Usuario: ${level} (Ajusta el tecnicismo, profundidad y ejemplos de código acorde a este nivel).
    
    RESTRICCIONES Y FORMATO DE SALIDA:

    #### 3.1. UX/UI METADATA
    * NO uses URLs reales ni verificadas.
    * Estructura Mobile-First.

    #### 3.2. CONTENIDO FORMATIVO
    * Divide el curso en 5 a 7 bloques temáticos (H2).
    * H3 para subtemas.
    * Usa ejemplos de código (PowerShell, JSON, YAML) donde aplique.
    * AL INICIO de cada bloque, incluye un tag visual: [TAG DE DIAGRAMA: descripción técnica del diagrama].
    * AL FINAL de cada bloque, incluye un indicador de progreso: [PROGRESS: XX] (Donde XX es el porcentaje acumulado, ej: 20, 40, 60...).
    * GLOSARIO: Cuando uses términos técnicos complejos (ej: Lakehouse, Medallion), usa el formato [[Término|Definición corta]] para que sean clicables.
    * RECURSOS SIMULADOS: Al final de cada bloque, antes del Quiz, añade una lista de recursos simulados con el formato: [RECURSO: Tipo | Título] (Ej: [RECURSO: Doc Oficial | Introducción a Pipelines]).

    #### 3.3. EVALUACIÓN Y REFUERZO
    * Al final de cada bloque, añade el título "#### Evaluación del Módulo".
    * Genera un bloque de código \`\`\`quiz con un JSON array de 3 objetos: { "question", "options", "correctAnswer" (index), "explanation" }.

    #### 3.4. CIERRE
    * Al final del curso, añade una sección H2 "Desafío de Aplicación Práctica" con un ejercicio real.
    * Finalmente, incluye EXACTAMENTE esta línea:
      > **[BOTÓN: Volver a las 10 Variaciones de Lección anteriores]**
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // No tools (grounding disabled as per request)
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return {
      title: variation,
      markdown: text,
    };
  } catch (error) {
    console.error("Error generating course:", error);
    throw error;
  }
};