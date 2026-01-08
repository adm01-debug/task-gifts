import { supabase } from "@/integrations/supabase/client";

export interface GeoAllowedCountry {
  id: string;
  country_code: string;
  country_name: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeoAccessLog {
  id: string;
  ip_address: string;
  country_code: string | null;
  country_name: string | null;
  user_id: string | null;
  was_allowed: boolean;
  reason: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface GeoSettings {
  id: string;
  is_enabled: boolean;
  block_unknown_countries: boolean;
  log_all_access: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface CreateCountryInput {
  country_code: string;
  country_name: string;
}

export interface UpdateCountryInput {
  country_name?: string;
  is_active?: boolean;
}

export interface UpdateSettingsInput {
  is_enabled?: boolean;
  block_unknown_countries?: boolean;
  log_all_access?: boolean;
}

// List of all countries for selection
export const ALL_COUNTRIES = [
  { code: 'AF', name: 'Afeganistão' },
  { code: 'ZA', name: 'África do Sul' },
  { code: 'AL', name: 'Albânia' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antígua e Barbuda' },
  { code: 'SA', name: 'Arábia Saudita' },
  { code: 'DZ', name: 'Argélia' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armênia' },
  { code: 'AU', name: 'Austrália' },
  { code: 'AT', name: 'Áustria' },
  { code: 'AZ', name: 'Azerbaijão' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BH', name: 'Bahrein' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BY', name: 'Bielorrússia' },
  { code: 'BO', name: 'Bolívia' },
  { code: 'BA', name: 'Bósnia e Herzegovina' },
  { code: 'BW', name: 'Botsuana' },
  { code: 'BR', name: 'Brasil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgária' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'BT', name: 'Butão' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'CM', name: 'Camarões' },
  { code: 'KH', name: 'Camboja' },
  { code: 'CA', name: 'Canadá' },
  { code: 'QA', name: 'Catar' },
  { code: 'KZ', name: 'Cazaquistão' },
  { code: 'TD', name: 'Chade' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CY', name: 'Chipre' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'KM', name: 'Comores' },
  { code: 'CG', name: 'Congo' },
  { code: 'KP', name: 'Coreia do Norte' },
  { code: 'KR', name: 'Coreia do Sul' },
  { code: 'CI', name: 'Costa do Marfim' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croácia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'DJ', name: 'Djibuti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'EG', name: 'Egito' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'AE', name: 'Emirados Árabes' },
  { code: 'EC', name: 'Equador' },
  { code: 'ER', name: 'Eritreia' },
  { code: 'SK', name: 'Eslováquia' },
  { code: 'SI', name: 'Eslovênia' },
  { code: 'ES', name: 'Espanha' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'EE', name: 'Estônia' },
  { code: 'ET', name: 'Etiópia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'PH', name: 'Filipinas' },
  { code: 'FI', name: 'Finlândia' },
  { code: 'FR', name: 'França' },
  { code: 'GA', name: 'Gabão' },
  { code: 'GM', name: 'Gâmbia' },
  { code: 'GH', name: 'Gana' },
  { code: 'GE', name: 'Geórgia' },
  { code: 'GR', name: 'Grécia' },
  { code: 'GD', name: 'Granada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GY', name: 'Guiana' },
  { code: 'GN', name: 'Guiné' },
  { code: 'GQ', name: 'Guiné Equatorial' },
  { code: 'GW', name: 'Guiné-Bissau' },
  { code: 'HT', name: 'Haiti' },
  { code: 'NL', name: 'Holanda' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungria' },
  { code: 'YE', name: 'Iêmen' },
  { code: 'IN', name: 'Índia' },
  { code: 'ID', name: 'Indonésia' },
  { code: 'IQ', name: 'Iraque' },
  { code: 'IR', name: 'Irã' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'IS', name: 'Islândia' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Itália' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japão' },
  { code: 'JO', name: 'Jordânia' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'LA', name: 'Laos' },
  { code: 'LS', name: 'Lesoto' },
  { code: 'LV', name: 'Letônia' },
  { code: 'LB', name: 'Líbano' },
  { code: 'LR', name: 'Libéria' },
  { code: 'LY', name: 'Líbia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lituânia' },
  { code: 'LU', name: 'Luxemburgo' },
  { code: 'MK', name: 'Macedônia do Norte' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MY', name: 'Malásia' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MV', name: 'Maldivas' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MA', name: 'Marrocos' },
  { code: 'MU', name: 'Maurício' },
  { code: 'MR', name: 'Mauritânia' },
  { code: 'MX', name: 'México' },
  { code: 'MM', name: 'Mianmar' },
  { code: 'FM', name: 'Micronésia' },
  { code: 'MZ', name: 'Moçambique' },
  { code: 'MD', name: 'Moldávia' },
  { code: 'MC', name: 'Mônaco' },
  { code: 'MN', name: 'Mongólia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'NA', name: 'Namíbia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NI', name: 'Nicarágua' },
  { code: 'NE', name: 'Níger' },
  { code: 'NG', name: 'Nigéria' },
  { code: 'NO', name: 'Noruega' },
  { code: 'NZ', name: 'Nova Zelândia' },
  { code: 'OM', name: 'Omã' },
  { code: 'PK', name: 'Paquistão' },
  { code: 'PW', name: 'Palau' },
  { code: 'PA', name: 'Panamá' },
  { code: 'PG', name: 'Papua Nova Guiné' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'PE', name: 'Peru' },
  { code: 'PL', name: 'Polônia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'KE', name: 'Quênia' },
  { code: 'KG', name: 'Quirguistão' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CF', name: 'República Centro-Africana' },
  { code: 'CD', name: 'República Democrática do Congo' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'CZ', name: 'República Tcheca' },
  { code: 'RO', name: 'Romênia' },
  { code: 'RW', name: 'Ruanda' },
  { code: 'RU', name: 'Rússia' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'LC', name: 'Santa Lúcia' },
  { code: 'KN', name: 'São Cristóvão e Nevis' },
  { code: 'ST', name: 'São Tomé e Príncipe' },
  { code: 'VC', name: 'São Vicente e Granadinas' },
  { code: 'SC', name: 'Seicheles' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SL', name: 'Serra Leoa' },
  { code: 'RS', name: 'Sérvia' },
  { code: 'SG', name: 'Singapura' },
  { code: 'SY', name: 'Síria' },
  { code: 'SO', name: 'Somália' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SZ', name: 'Suazilândia' },
  { code: 'SD', name: 'Sudão' },
  { code: 'SS', name: 'Sudão do Sul' },
  { code: 'SE', name: 'Suécia' },
  { code: 'CH', name: 'Suíça' },
  { code: 'SR', name: 'Suriname' },
  { code: 'TJ', name: 'Tajiquistão' },
  { code: 'TH', name: 'Tailândia' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TZ', name: 'Tanzânia' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad e Tobago' },
  { code: 'TN', name: 'Tunísia' },
  { code: 'TM', name: 'Turcomenistão' },
  { code: 'TR', name: 'Turquia' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UA', name: 'Ucrânia' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'UZ', name: 'Uzbequistão' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vaticano' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnã' },
  { code: 'ZM', name: 'Zâmbia' },
  { code: 'ZW', name: 'Zimbábue' }
];

class GeoBlockingService {
  async getSettings(): Promise<GeoSettings | null> {
    const { data, error } = await supabase
      .from('geo_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching geo settings:', error);
      return null;
    }
    return data as GeoSettings | null;
  }

  async updateSettings(input: UpdateSettingsInput): Promise<GeoSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('geo_settings')
      .update({
        ...input,
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as GeoSettings;
  }

  async getAllowedCountries(): Promise<GeoAllowedCountry[]> {
    const { data, error } = await supabase
      .from('geo_allowed_countries')
      .select('*')
      .order('country_name', { ascending: true });
    
    if (error) throw error;
    return (data || []) as GeoAllowedCountry[];
  }

  async addCountry(input: CreateCountryInput): Promise<GeoAllowedCountry> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('geo_allowed_countries')
      .insert({
        country_code: input.country_code.toUpperCase(),
        country_name: input.country_name,
        created_by: user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as GeoAllowedCountry;
  }

  async updateCountry(id: string, input: UpdateCountryInput): Promise<GeoAllowedCountry> {
    const { data, error } = await supabase
      .from('geo_allowed_countries')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as GeoAllowedCountry;
  }

  async deleteCountry(id: string): Promise<void> {
    const { error } = await supabase
      .from('geo_allowed_countries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async toggleCountryStatus(id: string, isActive: boolean): Promise<GeoAllowedCountry> {
    return this.updateCountry(id, { is_active: isActive });
  }

  async getAccessLogs(limit = 100): Promise<GeoAccessLog[]> {
    const { data, error } = await supabase
      .from('geo_access_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as GeoAccessLog[];
  }

  async verifyGeoAccess(): Promise<{
    allowed: boolean;
    ip?: string;
    country_code?: string;
    country_name?: string;
    reason?: string;
    message?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('verify-geo');
    
    if (error) {
      console.error('Error verifying geo:', error);
      return { allowed: true, reason: 'error', message: 'Erro na verificação' };
    }
    
    return data;
  }
}

export const geoBlockingService = new GeoBlockingService();
