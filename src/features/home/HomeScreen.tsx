import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Headphones, Users } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isHindi = lang === 'hi';
  const actions = [
    {
      number: '01',
      title: isHindi ? 'परिवार की प्रोफ़ाइल' : 'Set up your family',
      description: isHindi ? 'भाषा, सहमति, शहर और विद्यार्थी की जानकारी चुनें।' : 'Choose language, review consent, and add learner details.',
      href: '/language',
      icon: Users,
      accent: 'teal',
    },
    {
      number: '02',
      title: isHindi ? 'रास्ते देखें' : 'Explore pathways',
      description: isHindi ? 'प्रशिक्षण और करियर के विकल्पों की तुलना करें।' : 'Browse trades, training options, and career routes.',
      href: '/explore',
      icon: Compass,
      accent: 'blue',
    },
    {
      number: '03',
      title: isHindi ? 'काउंसलर से बात करें' : 'Talk it through',
      description: isHindi ? 'सवाल पूछें या मानव काउंसलर से कॉल का अनुरोध करें।' : 'Ask a question or request a callback from a human counsellor.',
      href: '/chat',
      icon: Headphones,
      accent: 'amber',
    },
  ];

  return (
    <div className="page-shell family-home">
      <header className="home-welcome">
        <div className="home-welcome-copy">
          <div className="eyebrow">{isHindi ? 'परिवार मार्गदर्शन' : 'FAMILY GUIDANCE'}</div>
          <h1>{isHindi ? 'करियर के फैसले, साथ मिलकर' : 'Career choices, together'}</h1>
          <p>{isHindi ? 'विद्यार्थी और परिवार प्रशिक्षण और करियर के रास्ते साथ मिलकर देख सकते हैं।' : 'Explore vocational training and career routes as a learner and family.'}</p>
        </div>
        <button type="button" className="home-start-button" onClick={() => navigate('/language')}>
          {isHindi ? 'परिवार की जानकारी शुरू करें' : 'Start family setup'}
          <ArrowRight size={17} />
        </button>
      </header>

      <section className="home-journey" aria-labelledby="home-journey-title">
        <div className="home-section-heading">
          <div>
            <div className="eyebrow">{isHindi ? 'आगे के कदम' : 'A SIMPLE JOURNEY'}</div>
            <h2 id="home-journey-title">{isHindi ? 'अपना अगला कदम चुनें' : 'Choose your next step'}</h2>
          </div>
          <span>{isHindi ? 'आप कभी भी वापस आ सकते हैं' : 'You can return to any step anytime'}</span>
        </div>

        <div className="home-step-grid">
          {actions.map(({ number, title, description, href, icon: Icon, accent }) => (
            <button key={number} type="button" className="home-step" onClick={() => navigate(href)}>
              <div className="home-step-topline">
                <span className="home-step-number">{number}</span>
                <span className={`home-step-icon ${accent}`}><Icon size={19} /></span>
              </div>
              <strong>{title}</strong>
              <span className="home-step-description">{description}</span>
              <span className="home-step-link">{isHindi ? 'खोलें' : 'Open'} <ArrowRight size={15} /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="home-help-row">
        <div className="home-help-mark"><Headphones size={19} /></div>
        <div>
          <strong>{isHindi ? 'किसी व्यक्ति से बात करना चाहते हैं?' : 'Prefer to talk to a person?'}</strong>
          <p>{isHindi ? 'काउंसलर से कॉल का अनुरोध करें।' : 'Request a callback from a counsellor.'}</p>
        </div>
        <button type="button" className="text-button" onClick={() => navigate('/escalation')}>
          {isHindi ? 'कॉल का अनुरोध' : 'Request callback'} <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
};

export default HomeScreen;