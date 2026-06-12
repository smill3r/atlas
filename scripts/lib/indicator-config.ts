export interface IndicatorSource {
  dir: string; // folder under datasets/
  code: string; // indicator code
  unit: string; // display unit
  dataCsv: string; // main data file name
  metaCsv: string; // Metadata_Country file name
  indicatorCsv: string; // Metadata_Indicator file name
}

export const INDICATOR_SOURCES: IndicatorSource[] = [
  {
    dir: 'API_EG',
    code: 'EG.ELC.ACCS.ZS',
    unit: '% of population',
    dataCsv: 'API_EG.ELC.ACCS.ZS_DS2_en_csv_v2_262855.csv',
    metaCsv: 'Metadata_Country_API_EG.ELC.ACCS.ZS_DS2_en_csv_v2_262855.csv',
    indicatorCsv: 'Metadata_Indicator_API_EG.ELC.ACCS.ZS_DS2_en_csv_v2_262855.csv',
  },
  {
    dir: 'API_EN',
    code: 'EN.GHG.CO2.MT.CE.AR5',
    unit: 'Mt CO2e',
    dataCsv: 'API_EN.GHG.CO2.MT.CE.AR5_DS2_en_csv_v2_263564.csv',
    metaCsv: 'Metadata_Country_API_EN.GHG.CO2.MT.CE.AR5_DS2_en_csv_v2_263564.csv',
    indicatorCsv: 'Metadata_Indicator_API_EN.GHG.CO2.MT.CE.AR5_DS2_en_csv_v2_263564.csv',
  },
  {
    dir: 'API_IT',
    code: 'IT.NET.USER.ZS',
    unit: '% of population',
    dataCsv: 'API_IT.NET.USER.ZS_DS2_en_csv_v2_293302.csv',
    metaCsv: 'Metadata_Country_API_IT.NET.USER.ZS_DS2_en_csv_v2_293302.csv',
    indicatorCsv: 'Metadata_Indicator_API_IT.NET.USER.ZS_DS2_en_csv_v2_293302.csv',
  },
  {
    dir: 'API_SE',
    code: 'SE.PRM.CMPT.FE.ZS',
    unit: '% of relevant age group',
    dataCsv: 'API_SE.PRM.CMPT.FE.ZS_DS2_en_csv_v2_278442.csv',
    metaCsv: 'Metadata_Country_API_SE.PRM.CMPT.FE.ZS_DS2_en_csv_v2_278442.csv',
    indicatorCsv: 'Metadata_Indicator_API_SE.PRM.CMPT.FE.ZS_DS2_en_csv_v2_278442.csv',
  },
];
