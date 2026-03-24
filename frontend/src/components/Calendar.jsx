import { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import './Calendar.css';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const Calendar = ({ 
  label, 
  placeholder = "Selecione uma data", 
  value,
  onChange,
  name,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value + 'T00:00:00');
    return new Date();
  });
  const containerRef = useRef(null);

  // Parse do valor selecionado
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fecha com ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Atualiza viewDate quando value muda
  useEffect(() => {
    if (value) {
      setViewDate(new Date(value + 'T00:00:00'));
    }
  }, [value]);

  // Navegação
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const prevYear = () => {
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
  };

  const nextYear = () => {
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
  };

  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    handleSelectDate(today);
  };

  // Gera os dias do mês
  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Dias do mês anterior para preencher a primeira semana
    const firstDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day)
      });
    }
    
    // Dias do próximo mês para completar
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day)
      });
    }
    
    return days;
  };

  const handleSelectDate = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    
    // Simula evento para manter compatibilidade com handleChange
    if (onChange) {
      onChange({
        target: {
          name,
          value: formattedDate
        }
      });
    }
    setIsOpen(false);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const days = getDaysInMonth();

  return (
    <div className="calendar-picker" ref={containerRef}>
      {label && (
        <label className="calendar-label">
          {label} {required && '*'}
        </label>
      )}
      
      <button
        className={`calendar-trigger ${isOpen ? 'active' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="calendar-value">
          {formatDisplayDate(value) || placeholder}
        </span>
        <CalendarIcon size={18} className="calendar-icon" />
      </button>

      {isOpen && (
        <div className="calendar-popup">
          {/* Header com navegação */}
          <div className="calendar-header">
            <div className="calendar-nav">
              <button type="button" onClick={prevYear} className="calendar-nav-btn" title="Ano anterior">
                <ChevronsLeft size={18} />
              </button>
              <button type="button" onClick={prevMonth} className="calendar-nav-btn" title="Mês anterior">
                <ChevronLeft size={18} />
              </button>
            </div>
            
            <span className="calendar-title">
              {MESES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            
            <div className="calendar-nav">
              <button type="button" onClick={nextMonth} className="calendar-nav-btn" title="Próximo mês">
                <ChevronRight size={18} />
              </button>
              <button type="button" onClick={nextYear} className="calendar-nav-btn" title="Próximo ano">
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>

          {/* Dias da semana */}
          <div className="calendar-weekdays">
            {DIAS_SEMANA.map((dia) => (
              <span key={dia} className="calendar-weekday">{dia}</span>
            ))}
          </div>

          {/* Grade de dias */}
          <div className="calendar-days">
            {days.map((dayObj, index) => (
              <button
                key={index}
                type="button"
                className={`calendar-day 
                  ${!dayObj.isCurrentMonth ? 'other-month' : ''} 
                  ${isToday(dayObj.date) ? 'today' : ''} 
                  ${isSelected(dayObj.date) ? 'selected' : ''}`}
                onClick={() => handleSelectDate(dayObj.date)}
              >
                {dayObj.day}
              </button>
            ))}
          </div>

          {/* Footer com botão Hoje */}
          <div className="calendar-footer">
            <button type="button" className="calendar-today-btn" onClick={goToToday}>
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
