# DESIGN SYSTEM MILITAR/TÁTICO - ANÁLISE COMPLETA DAS PÁGINAS DO ALUNO

## ÍNDICE
1. [Cores e Paleta](#cores-e-paleta)
2. [Tipografia Militar](#tipografia-militar)
3. [Sidebar](#sidebar)
4. [Layout e Header](#layout-e-header)
5. [Cards Táticos](#cards-táticos)
6. [Elementos Decorativos](#elementos-decorativos)
7. [Botões e Interações](#botões-e-interações)
8. [Animações Framer Motion](#animações-framer-motion)
9. [Background Patterns](#background-patterns)
10. [Badge System](#badge-system)
11. [Terminologia Militar](#terminologia-militar)
12. [Código Reutilizável](#código-reutilizável)

---

## CORES E PALETA

### **Cores Principais**
```js
// Tailwind Config Colors
primary: {
  600: '#14242f', // Cor militar base principal
}
accent: {
  500: '#facc15', // Yellow tactical - destaque principal
  600: '#d97706', // Yellow hover (light theme)
  650: '#d06e0f', // Orange hover (dark theme)
}
```

### **Sistema de Aplicação de Cores**

#### **Backgrounds Principais**
```css
/* Header gradientes */
bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900
bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black

/* Cards */
bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
bg-gray-50 dark:bg-black (para páginas principais)

/* Military base pattern */
bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900
```

#### **Cores de Destaque Tático**
```css
/* Accent stripes */
bg-accent-500 (yellow tactical)
text-accent-500
border-accent-500

/* Status colors */
text-green-600 dark:text-green-400 (sucesso)
text-red-600 dark:text-red-400 (perigo)
text-amber-600 dark:text-amber-400 (atenção)
text-purple-600 dark:text-purple-400 (especial)
```

---

## TIPOGRAFIA MILITAR

### **Fonts Definidas**
```js
fontFamily: {
  'police-title': ['Orbitron', 'monospace'],      // Títulos principais
  'police-subtitle': ['Rajdhani', 'sans-serif'],  // Subtítulos
  'police-body': ['Rajdhani', 'sans-serif'],      // Corpo de texto
  'police-numbers': ['Exo 2', 'sans-serif'],      // Números/stats
}
```

### **Padrões de Uso**

#### **Títulos Principais (H1)**
```css
/* Padrão para títulos grandes */
text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide

/* Exemplo de DashboardPage */
text-2xl lg:text-3xl font-police-title font-bold uppercase tracking-wider text-white
```

#### **Subtítulos (H2-H4)**
```css
/* Subtítulos de seção */
text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider

/* Subtítulos menores */
text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider
```

#### **Corpo de Texto**
```css
/* Texto normal */
font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider

/* Texto de navegação */
font-police-body uppercase tracking-wider text-sm
```

#### **Números e Stats**
```css
/* Números grandes */
text-2xl lg:text-3xl font-police-numbers font-bold

/* Labels pequenas */
text-xs font-police-numbers text-gray-600 dark:text-gray-400
```

### **Letter Spacing Tactical**
```js
letterSpacing: {
  'widest': '0.1em',
  'widest-plus': '0.15em',
  'ultra-wide': '0.2em',
}
```

---

## SIDEBAR

### **Estrutura Base**
```jsx
<motion.aside
  className={cn(
    'lg:relative top-0 left-0 h-screen bg-gray-900 dark:bg-gray-950 text-white z-40',
    'flex flex-col transition-all duration-300 ease-in-out shadow-xl border-r border-gray-700 dark:border-gray-800'
  )}
/>
```

### **Header da Sidebar**
```jsx
<div className="p-4 border-b border-gray-700 dark:border-gray-800">
  <Logo variant={isOpen ? "full" : "icon"} size="sm" animated={true} />
</div>
```

### **User Info Section**
```jsx
<div className="p-4 border-b border-gray-700 dark:border-gray-800">
  <div className="flex items-center gap-3">
    <img
      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=14242f&color=fff`}
      className="w-10 h-10 rounded-full flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="font-medium truncate font-police-body uppercase tracking-wider">{user.name}</p>
      <p className="text-xs text-gray-400 truncate font-police-body uppercase tracking-wider">{plan}</p>
    </div>
  </div>
</div>
```

### **Itens de Navegação**
```jsx
<Link
  className={cn(
    'flex items-center rounded-lg transition-all relative',
    'hover:bg-gray-800 dark:hover:bg-gray-800',
    isActive && 'bg-gray-800 dark:bg-gray-800 shadow-lg border-l-2 border-white',
    isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5'
  )}
>
  <Icon className="w-5 h-5 flex-shrink-0" />
  {isOpen && (
    <span className="font-medium whitespace-nowrap overflow-hidden font-police-body uppercase tracking-wider text-sm">
      {item.label}
    </span>
  )}
</Link>
```

### **Bottom Section**
```jsx
<div className={cn(
  "border-t border-primary-500 space-y-1",
  isOpen ? "p-4" : "px-2 py-4"
)}>
  {/* Itens do bottom com hover:bg-primary-500 */}
</div>
```

### **Terminologia da Sidebar**
```js
const menuItems = [
  { icon: Command, label: 'COMANDO CENTRAL', path: '/dashboard' },
  { icon: Activity, label: 'MINHAS OPERAÇÕES', path: '/my-courses' },
  { icon: Binoculars, label: 'OPERAÇÕES DISPONÍVEIS', path: '/courses' },
  { icon: Calendar, label: 'CRONOGRAMA TÁTICO', path: '/schedule' },
  { icon: Target, label: 'SIMULAÇÕES TÁTICAS', path: '/simulations' },
  { icon: Flame, label: 'CARTÕES TÁTICOS', path: '/flashcards' },
  { icon: Crosshair, label: 'EXERCÍCIOS TÁTICOS', path: '/questions' },
  { icon: Archive, label: 'ARQUIVO DE PROVAS', path: '/previous-exams' },
  // ... mais itens
];
```

---

## LAYOUT E HEADER

### **Header Principal**
```jsx
<header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <Button /* Toggle sidebar */
        variant="ghost"
        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        <PanelLeft className="w-5 h-5" />
      </Button>
      <h1 className="text-xl font-semibold font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
        {currentTitle}
      </h1>
    </div>
    <ThemeToggle />
  </div>
</header>
```

### **Container Principal**
```jsx
<main className="flex-1 overflow-y-auto">
  <div className="container mx-auto px-4 py-8 lg:px-8">
    <Outlet />
  </div>
</main>
```

### **Toast Notifications (Military Theme)**
```jsx
<Toaster
  position="top-right"
  toastOptions={{
    style: {
      background: '#14242f', // Military base color
      color: '#fff',
    },
    success: {
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    },
  }}
/>
```

---

## CARDS TÁTICOS

### **Card Base Militar**
```jsx
<Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
  {/* Tactical corner elements */}
  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-500/20" />
  
  <CardContent className="p-6">
    {/* Conteúdo */}
  </CardContent>
</Card>
```

### **Card com Header Militar**
```jsx
<Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 relative overflow-hidden">
  {/* Tactical stripes */}
  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-transparent to-accent-500 opacity-50" />
  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-30" />
  
  <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black text-white rounded-t-lg">
    <CardTitle className="flex items-center gap-2 text-white font-police-title uppercase tracking-wider">
      <Crosshair className="w-5 h-5 text-accent-500" />
      ALVOS OPERACIONAIS - HOJE
    </CardTitle>
  </CardHeader>
</Card>
```

### **Stats Card Pattern**
```jsx
<Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 backdrop-blur-sm relative overflow-hidden">
  {/* Tactical stripe vertical */}
  <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
  
  <CardContent className="p-4 flex items-center gap-3">
    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
      <Icon className={`w-5 h-5 ${stat.color}`} />
    </div>
    <div>
      <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
        {stat.label}
      </p>
      <p className="text-lg font-bold font-police-numbers text-gray-900 dark:text-white">
        {stat.value}
      </p>
    </div>
  </CardContent>
</Card>
```

---

## ELEMENTOS DECORATIVOS

### **Tactical Stripes (Mais Usados)**
```jsx
{/* Stripe vertical direita */}
<div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />

{/* Stripes horizontais */}
<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-transparent to-accent-500 opacity-50" />
<div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-30" />
```

### **Corner Accents**
```jsx
{/* Cantos pequenos */}
<div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
<div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-500/20" />

{/* Cantos maiores */}
<div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-accent-500/20" />
<div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-accent-500/20" />
```

### **Border Patterns**
```jsx
{/* Left border accent */}
border-l-4 border-l-accent-500

{/* All borders */}
border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500/50
```

---

## BOTÕES E INTERAÇÕES

### **Botão Primary (Accent)**
```jsx
<Button className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider">
  BOTÃO TÁTICO
</Button>
```

### **Botão Ghost Tactical**
```jsx
<Button
  variant="ghost"
  className="hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30"
>
  <Icon className="w-4 h-4" />
</Button>
```

### **Botão Outline Military**
```jsx
<Button
  variant="outline"
  className="gap-2 font-police-body uppercase tracking-wider hover:bg-accent-500 hover:text-black border border-accent-500/30 hover:border-accent-500"
>
  COMANDO TÁTICO
  <Command className="w-4 h-4" />
</Button>
```

### **Hover States Padrão**
```css
/* Cards hover */
hover:shadow-xl transition-all duration-300
hover:border-accent-500 dark:hover:border-accent-500

/* Buttons hover */
hover:scale-105 transition-all duration-300

/* Text hover */
group-hover:text-accent-500 transition-colors
```

---

## ANIMAÇÕES FRAMER MOTION

### **Container Variants**
```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};
```

### **Hover Animations**
```jsx
<motion.div
  whileHover={{ y: -4, shadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)" }}
  whileTap={{ scale: 0.98 }}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
```

### **Progress Bar Animation**
```jsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: 1.5, delay: 0.5 + index * 0.15, ease: "easeOut" }}
  className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
/>
```

### **Sidebar Animation**
```jsx
<motion.aside
  initial={false}
  animate={{
    width: isOpen ? sidebarWidth : COLLAPSED_WIDTH,
  }}
  className="transition-all duration-300 ease-in-out"
>
```

---

## BACKGROUND PATTERNS

### **Tactical Grid Pattern**
```jsx
{/* Grid pattern sutil */}
<div 
  className="absolute inset-0 opacity-5" 
  style={{ 
    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)', 
    backgroundSize: '20px 20px' 
  }} 
/>
```

### **Diagonal Military Pattern**
```jsx
{/* Background diagonal */}
<div 
  className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none"
  style={{
    backgroundImage: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 35px,
      rgba(250, 204, 21, 0.05) 35px,
      rgba(250, 204, 21, 0.05) 70px
    )`
  }}
/>
```

### **Header Background Pattern**
```jsx
{/* Tactical background pattern */}
<div className="absolute inset-0 opacity-5">
  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent" />
  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent" />
  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-accent-500 to-transparent" />
  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-accent-500 to-transparent" />
</div>
```

---

## BADGE SYSTEM

### **Badge Padrão Militar**
```jsx
<Badge className="bg-accent-500 text-black font-police-numbers font-semibold">
  #{rank}
</Badge>
```

### **Badge por Status**
```jsx
{/* Success */}
<Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-police-body uppercase tracking-wider">
  OPERACIONAL
</Badge>

{/* Warning */}
<Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-police-body uppercase tracking-wider">
  OFFLINE
</Badge>
```

### **Badge Colors by Type**
```jsx
const getBadgeColor = (type) => {
  switch (type) {
    case 'blue': return 'bg-accent-500 text-black';
    case 'green': return 'text-green-600 dark:text-green-400';
    case 'yellow': return 'text-amber-600 dark:text-amber-400';
    case 'purple': return 'text-purple-600 dark:text-purple-400';
    case 'red': return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
};
```

---

## TERMINOLOGIA MILITAR

### **Interface Elements**
```js
// Páginas principais
'COMANDO CENTRAL' // Dashboard
'OPERAÇÕES DISPONÍVEIS' // Courses
'ARSENAL TÁTICO' // Quick Actions
'CRONOGRAMA TÁTICO' // Schedule
'CARTÕES TÁTICOS' // Flashcards
'EXERCÍCIOS TÁTICOS' // Questions
'SIMULAÇÕES TÁTICAS' // Mock Exams

// Stats e métricas
'ALVOS ELIMINADOS' // Correct answers
'PRECISÃO TÁTICA' // Accuracy
'OPERAÇÃO COMPLETA' // Completed
'STATUS OPERACIONAL' // Progress status
'SEQUÊNCIA OPERACIONAL' // Study streak
```

### **User Roles**
```js
'OPERADOR' // Standard user
'AGENTE' // Agent level
'RECRUTA' // Beginner
'SARGENTO' // Advanced
'COMANDANTE' // Instructor
'LÍDER DE ESQUADRÃO' // Group leader
```

### **Actions & Features**
```js
'INICIAR OPERAÇÃO' // Start exam/study
'COMANDO TÁTICO' // Tactical panel
'ARSENAL' // Tools/Resources  
'INTEL CARDS' // Flashcards
'BRIEFINGS' // Summaries
'CLEARANCE' // Subscription level
'ESQUADRÕES' // Study groups
```

---

## CÓDIGO REUTILIZÁVEL

### **TacticalCard Component Pattern**
```jsx
const TacticalCard = ({ children, withStripe = true, withCorners = false, className = "" }) => (
  <Card className={cn(
    "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 relative overflow-hidden",
    "hover:shadow-xl transition-all duration-300",
    withStripe && "border-l-4 border-l-accent-500",
    className
  )}>
    {withStripe && <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />}
    {withCorners && (
      <>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-500/20" />
      </>
    )}
    {children}
  </Card>
);
```

### **MilitaryButton Component Pattern**
```jsx
const MilitaryButton = ({ 
  variant = 'primary', 
  children, 
  icon: Icon, 
  className = "",
  ...props 
}) => (
  <Button
    className={cn(
      "font-police-body font-semibold uppercase tracking-wider transition-all duration-300",
      variant === 'primary' && "bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black hover:scale-105",
      variant === 'tactical' && "hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30",
      className
    )}
    {...props}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </Button>
);
```

### **StatCard Component Pattern**
```jsx
const StatCard = ({ icon: Icon, label, value, trend, color = "accent" }) => (
  <TacticalCard withStripe>
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-100 shadow-sm`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-police-numbers px-2 py-1 rounded-full ${
            trend.type === 'up' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
          }`}>
            {trend.type === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {trend.value}
          </div>
        )}
      </div>
      <h3 className="text-2xl lg:text-3xl font-police-numbers font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </h3>
      <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
    </CardContent>
  </TacticalCard>
);
```

### **Progress Bar Military**
```jsx
const MilitaryProgressBar = ({ progress, label, showPercentage = true }) => (
  <div className="relative">
    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${
          progress >= 75 ? 'from-green-400 to-green-600' : 
          progress >= 50 ? 'from-yellow-400 to-yellow-600' : 
          'from-red-400 to-red-600'
        }`}
      />
    </div>
    {showPercentage && (
      <span className="absolute right-0 -top-6 text-xs font-police-numbers font-medium text-gray-700 dark:text-gray-300">
        {progress}%
      </span>
    )}
  </div>
);
```

---

## OBSERVAÇÕES IMPORTANTES

1. **Consistência**: Todas as páginas usam o mesmo sistema de cores `#14242f` como base militar e `#facc15` como accent.

2. **Responsividade**: Mobile-first com breakpoints `md:` e `lg:` para todos os elementos.

3. **Dark Mode**: Suporte completo com variantes `dark:` em todos os componentes.

4. **Acessibilidade**: Contraste adequado e navegação por teclado mantida.

5. **Performance**: Uso de `backdrop-blur-sm` e opacidades para efeitos visuais leves.

6. **Animações**: Framer Motion usado consistentemente com durações de 0.3s para transições.

Este design system garante consistência visual militar/tática em todas as interfaces do estudante, mantendo funcionalidade e usabilidade profissionais.