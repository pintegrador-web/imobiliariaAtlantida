import logoAtlantida from '../../assets/logo.png';

const LogoAtlantida = ({ size = 60, className = "" }) => (
  <img
    src={logoAtlantida}
    alt="Atlântida Imóveis"
    className={className}
    style={{ height: `${size}px`, width: 'auto', objectFit: 'contain' }}
  />
);

export default LogoAtlantida;