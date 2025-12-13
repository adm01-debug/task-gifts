import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Gamepad2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MagicCardQuiz, QuizQuestion } from "@/components/quiz/MagicCardQuiz";
import { MillionaireQuiz, MillionaireQuestion } from "@/components/quiz/MillionaireQuiz";
import { QuizDailyRanking } from "@/components/quiz/QuizDailyRanking";
import { useSaveQuizScore } from "@/hooks/useQuizScores";
import { toast } from "sonner";

// Sample questions for demo - in production these would come from the database
const sampleMagicQuestions: QuizQuestion[] = [
  {
    id: "1",
    question: "Qual é o prazo padrão para orçamentos na Promo Brindes?",
    options: [
      { id: "a", text: "24 horas", isCorrect: false },
      { id: "b", text: "48 horas", isCorrect: true },
      { id: "c", text: "72 horas", isCorrect: false },
    ],
    explanation: "O prazo padrão para orçamentos é de 48 horas, garantindo qualidade e precisão.",
    points: 100,
  },
  {
    id: "2",
    question: "Quantas técnicas de gravação a Promo Brindes domina?",
    options: [
      { id: "a", text: "4 técnicas", isCorrect: false },
      { id: "b", text: "6 técnicas", isCorrect: false },
      { id: "c", text: "8 técnicas", isCorrect: true },
    ],
    explanation: "Dominamos 8 técnicas: Silk Screen, Laser, Bordado, DTF, Tampografia, Sublimação, UV e Transfer.",
    points: 150,
  },
  {
    id: "3",
    question: "Qual sistema usamos para gestão de clientes?",
    options: [
      { id: "a", text: "Bitrix24", isCorrect: true },
      { id: "b", text: "Salesforce", isCorrect: false },
      { id: "c", text: "HubSpot", isCorrect: false },
    ],
    explanation: "O Bitrix24 é nossa plataforma principal de CRM e gestão de processos.",
    points: 100,
  },
  {
    id: "4",
    question: "Há quantos anos a Promo Brindes está no mercado?",
    options: [
      { id: "a", text: "8 anos", isCorrect: false },
      { id: "b", text: "11 anos", isCorrect: true },
      { id: "c", text: "15 anos", isCorrect: false },
    ],
    explanation: "São 11 anos de experiência no mercado de brindes corporativos!",
    points: 100,
  },
  {
    id: "5",
    question: "Qual é a média de pedidos por mês na empresa?",
    options: [
      { id: "a", text: "~150 pedidos", isCorrect: false },
      { id: "b", text: "~300 pedidos", isCorrect: true },
      { id: "c", text: "~500 pedidos", isCorrect: false },
    ],
    explanation: "Processamos aproximadamente 300 pedidos por mês, mantendo alta qualidade.",
    points: 150,
  },
];

const sampleMillionaireQuestions: MillionaireQuestion[] = [
  {
    id: "m1",
    question: "Qual é o primeiro passo ao receber uma solicitação de orçamento?",
    options: [
      { id: "a", text: "Enviar preço imediatamente", isCorrect: false },
      { id: "b", text: "Verificar disponibilidade do produto", isCorrect: false },
      { id: "c", text: "Entender a necessidade do cliente", isCorrect: true },
      { id: "d", text: "Encaminhar para o financeiro", isCorrect: false },
    ],
    difficulty: "easy",
    explanation: "Sempre começamos entendendo a necessidade real do cliente antes de qualquer ação.",
  },
  {
    id: "m2",
    question: "Qual técnica de gravação é mais indicada para tecidos?",
    options: [
      { id: "a", text: "Laser", isCorrect: false },
      { id: "b", text: "Bordado ou DTF", isCorrect: true },
      { id: "c", text: "Tampografia", isCorrect: false },
      { id: "d", text: "Sublimação apenas", isCorrect: false },
    ],
    difficulty: "easy",
    explanation: "Bordado e DTF são as técnicas mais adequadas para tecidos, oferecendo durabilidade.",
  },
  {
    id: "m3",
    question: "Quantos departamentos a Promo Brindes possui?",
    options: [
      { id: "a", text: "8 departamentos", isCorrect: false },
      { id: "b", text: "10 departamentos", isCorrect: false },
      { id: "c", text: "12 departamentos", isCorrect: false },
      { id: "d", text: "14 departamentos", isCorrect: true },
    ],
    difficulty: "medium",
    explanation: "São 14 departamentos trabalhando em sintonia para entregar excelência.",
  },
  {
    id: "m4",
    question: "Qual é o diferencial competitivo da Promo Brindes?",
    options: [
      { id: "a", text: "Menor preço do mercado", isCorrect: false },
      { id: "b", text: "Cumprimento de prazos para eventos", isCorrect: true },
      { id: "c", text: "Maior variedade de produtos", isCorrect: false },
      { id: "d", text: "Frete grátis", isCorrect: false },
    ],
    difficulty: "medium",
    explanation: "Nosso diferencial é nunca deixar o cliente na mão em datas importantes!",
  },
  {
    id: "m5",
    question: "O que significa a sigla SKU no contexto do estoque?",
    options: [
      { id: "a", text: "Stock Keeping Unit", isCorrect: true },
      { id: "b", text: "Standard Kit Utility", isCorrect: false },
      { id: "c", text: "Sistema de Controle Único", isCorrect: false },
      { id: "d", text: "Serviço de Qualidade Unificado", isCorrect: false },
    ],
    difficulty: "medium",
    explanation: "SKU (Stock Keeping Unit) é o código único de identificação de cada produto.",
  },
  {
    id: "m6",
    question: "Em qual cidade fica a produção da Promo Brindes?",
    options: [
      { id: "a", text: "Goiânia", isCorrect: false },
      { id: "b", text: "São Paulo", isCorrect: true },
      { id: "c", text: "Rio de Janeiro", isCorrect: false },
      { id: "d", text: "Brasília", isCorrect: false },
    ],
    difficulty: "easy",
    explanation: "A produção fica em São Paulo e o administrativo em Goiás.",
  },
  {
    id: "m7",
    question: "Qual é o prazo mínimo recomendado para pedidos com gravação especial?",
    options: [
      { id: "a", text: "3 dias úteis", isCorrect: false },
      { id: "b", text: "5 dias úteis", isCorrect: false },
      { id: "c", text: "7 dias úteis", isCorrect: true },
      { id: "d", text: "10 dias úteis", isCorrect: false },
    ],
    difficulty: "hard",
    explanation: "Para gravações especiais, 7 dias úteis garantem qualidade e revisão adequada.",
  },
  {
    id: "m8",
    question: "Qual setor é responsável pela aprovação final de artes?",
    options: [
      { id: "a", text: "Comercial", isCorrect: false },
      { id: "b", text: "Artes", isCorrect: true },
      { id: "c", text: "Gravação", isCorrect: false },
      { id: "d", text: "Expedição", isCorrect: false },
    ],
    difficulty: "easy",
    explanation: "O setor de Artes é responsável por criar, revisar e aprovar todas as artes.",
  },
];

export default function DailyQuiz() {
  const navigate = useNavigate();
  const [activeQuiz, setActiveQuiz] = useState<"magic" | "millionaire" | null>(null);
  const [completedToday, setCompletedToday] = useState({
    magic: false,
    millionaire: false,
  });
  const saveScore = useSaveQuizScore();

  const handleMagicComplete = (score: number, totalPoints: number, correctAnswers: number) => {
    saveScore.mutate({
      quiz_type: 'magic_cards',
      score,
      correct_answers: correctAnswers,
      total_questions: sampleMagicQuestions.length,
      streak_bonus: score - (correctAnswers * 100),
    }, {
      onSuccess: () => {
        toast.success("Pontuação salva no ranking!");
        setCompletedToday(prev => ({ ...prev, magic: true }));
      },
    });
  };

  const handleMillionaireComplete = (level: number, prize: number) => {
    saveScore.mutate({
      quiz_type: 'millionaire',
      score: prize,
      correct_answers: level,
      total_questions: sampleMillionaireQuestions.length,
    }, {
      onSuccess: () => {
        toast.success("Pontuação salva no ranking!");
        setCompletedToday(prev => ({ ...prev, millionaire: true }));
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            className="mb-4 gap-2"
            onClick={() => activeQuiz ? setActiveQuiz(null) : navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            {activeQuiz ? "Voltar aos Quiz" : "Voltar"}
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Quiz Diário</h1>
          </div>
          <p className="text-muted-foreground">
            Dedique 10 minutos do seu dia para aprender jogando!
          </p>
        </motion.div>

        {!activeQuiz ? (
          /* Quiz Selection + Ranking */
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 grid md:grid-cols-2 gap-6"
            >
              {/* Magic Cards Quiz */}
              <Card 
                className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-purple-500/10 hover:border-primary/40 transition-all cursor-pointer group"
                onClick={() => setActiveQuiz("magic")}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-primary/20 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    {completedToday.magic && (
                      <span className="text-xs text-emerald-500 font-medium">✓ Concluído hoje</span>
                    )}
                  </div>
                  <CardTitle className="text-2xl mt-4">Cartas Mágicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Vire as cartas para revelar perguntas! Cada carta esconde um desafio com pontuação baseada na dificuldade.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Animações de flip interativas
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Sistema de streak para bônus
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Explicações após cada resposta
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Button className="w-full gap-2 group-hover:bg-primary/90">
                      <Sparkles className="w-4 h-4" />
                      Jogar Cartas Mágicas
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Millionaire Quiz */}
              <Card 
                className="overflow-hidden border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:border-amber-500/40 transition-all cursor-pointer group"
                onClick={() => setActiveQuiz("millionaire")}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-amber-500/20 group-hover:scale-110 transition-transform">
                      <Trophy className="w-8 h-8 text-amber-500" />
                    </div>
                    {completedToday.millionaire && (
                      <span className="text-xs text-emerald-500 font-medium">✓ Concluído hoje</span>
                    )}
                  </div>
                  <CardTitle className="text-2xl mt-4">Show do Milhão</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Responda perguntas de dificuldade crescente e acumule pontos! Use suas ajudas com sabedoria.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Escada de prêmios progressiva
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      3 ajudas: 50/50, Plateia, Telefone
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Timer e checkpoints de segurança
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Button className="w-full gap-2 bg-amber-500 hover:bg-amber-600">
                      <Trophy className="w-4 h-4" />
                      Jogar Show do Milhão
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Daily Ranking */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <QuizDailyRanking />
            </motion.div>
          </div>
        ) : activeQuiz === "magic" ? (
          /* Magic Cards Game */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <MagicCardQuiz 
              questions={sampleMagicQuestions} 
              title="Quiz Diário - Cartas Mágicas"
              onComplete={handleMagicComplete}
            />
          </motion.div>
        ) : (
          /* Millionaire Game */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <MillionaireQuiz 
              questions={sampleMillionaireQuestions}
              title="Show do Milhão - Promo Brindes"
              onComplete={handleMillionaireComplete}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}