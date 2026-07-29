import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { prisma } from "../lib/prisma";

const searchProductsDeclaration: FunctionDeclaration = {
  name: "searchProducts",
  description: "Search for products in the database by name or category. Use this to find real products to recommend to the user.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description: "The search query, e.g., 'lipstick', 'sunscreen', 'kem chống nắng'.",
      },
    },
    required: ["query"],
  },
};

export class AiService {
  private getModel() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    return genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      tools: [
        {
          functionDeclarations: [searchProductsDeclaration],
        },
      ],
      systemInstruction: `You are a helpful and polite customer support chatbot for "Hasaki Cosmetics" e-commerce website.
You help users find products, understand their skin care needs, and guide them to make a purchase.
You MUST use the searchProducts tool to look up real products from the database when the user asks for recommendations or specific products.
When displaying a product, provide its name, brand, price, and a direct link to the product using Markdown link format: [Tên sản phẩm](/products/{id}). Make sure to use the 'id' returned from the searchProducts tool. Emphasize that the user can buy it on the website by clicking the link.
Your responses should be in Vietnamese. Be concise, friendly, and use markdown formatting to make the response look good.`,
    });
  }

  public async chat(history: any[], message: string) {
    try {
      const model = this.getModel();
      
      let formattedHistory = history.map((msg) => ({
        role: msg.role,
        parts: msg.parts.map((p: any) => ({ text: p.text })),
      }));

      // Gemini requires the first message to be from 'user'. Remove any leading 'model' messages.
      while (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
        formattedHistory.shift();
      }

      const chat = model.startChat({
        history: formattedHistory,
      });

      let result = await chat.sendMessage(message);
      
      const calls = result.response.functionCalls();
      if (calls && calls.length > 0) {
        const call = calls[0];
        if (call.name === "searchProducts") {
          const query = (call.args as any).query as string;
          
          // Perform database search
          const products = await prisma.product.findMany({
            where: {
              name: {
                contains: query,
                mode: 'insensitive'
              },
              isActive: true
            },
            select: {
              id: true,
              name: true,
              price: true,
              brand: true,
              slug: true
            },
            take: 5
          });

          // Send the function response back to Gemini
          result = await chat.sendMessage([{
            functionResponse: {
              name: 'searchProducts',
              response: { products }
            }
          }]);
        }
      }

      return {
        role: "model",
        text: result.response.text(),
      };
    } catch (error) {
      console.error("AI Chat Error:", error);
      throw new Error("Failed to process chat message");
    }
  }
}

export const aiService = new AiService();
