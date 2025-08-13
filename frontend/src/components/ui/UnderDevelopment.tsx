import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './Button';

interface UnderDevelopmentProps {
  title: string;
  description: string;
  icon?: React.ElementType;
}

export function UnderDevelopment({ title, description, icon: Icon = Construction }: UnderDevelopmentProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6"
    >
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo variant="icon" size="lg" animated={true} />
        </div>
        
        {/* Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 flex justify-center"
        >
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
            <Icon className="w-12 h-12 text-primary-600" />
          </div>
        </motion.div>
        
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-primary-900 mb-4"
        >
          {title}
        </motion.h1>
        
        {/* Description */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-primary-600 mb-8"
        >
          {description}
        </motion.p>
        
        {/* Status Badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-8"
        >
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          Em desenvolvimento
        </motion.div>
        
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}