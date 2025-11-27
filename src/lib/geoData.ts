// biome-ignore lint/suspicious/noExplicitAny: 動的なインポートのため
const geoLoaders: Record<string, () => Promise<any>> = {
  afghanistanLow: () =>
    import("@amcharts/amcharts5-geodata/json/afghanistanLow.json"),
  albaniaLow: () => import("@amcharts/amcharts5-geodata/json/albaniaLow.json"),
  algeriaLow: () => import("@amcharts/amcharts5-geodata/json/algeriaLow.json"),
  americanSamoaLow: () =>
    import("@amcharts/amcharts5-geodata/json/americanSamoaLow.json"),
  andorraLow: () => import("@amcharts/amcharts5-geodata/json/andorraLow.json"),
  angolaLow: () => import("@amcharts/amcharts5-geodata/json/angolaLow.json"),
  anguillaLow: () =>
    import("@amcharts/amcharts5-geodata/json/anguillaLow.json"),
  antiguaBarbudaLow: () =>
    import("@amcharts/amcharts5-geodata/json/antiguaBarbudaLow.json"),
  argentinaLow: () =>
    import("@amcharts/amcharts5-geodata/json/argentinaLow.json"),
  armeniaLow: () => import("@amcharts/amcharts5-geodata/json/armeniaLow.json"),
  arubaLow: () => import("@amcharts/amcharts5-geodata/json/arubaLow.json"),
  australiaLow: () =>
    import("@amcharts/amcharts5-geodata/json/australiaLow.json"),
  austriaLow: () => import("@amcharts/amcharts5-geodata/json/austriaLow.json"),
  azerbaijanLow: () =>
    import("@amcharts/amcharts5-geodata/json/azerbaijanLow.json"),
  bahamasLow: () => import("@amcharts/amcharts5-geodata/json/bahamasLow.json"),
  bahrainLow: () => import("@amcharts/amcharts5-geodata/json/bahrainLow.json"),
  bangladeshLow: () =>
    import("@amcharts/amcharts5-geodata/json/bangladeshLow.json"),
  barbadosLow: () =>
    import("@amcharts/amcharts5-geodata/json/barbadosLow.json"),
  belarusLow: () => import("@amcharts/amcharts5-geodata/json/belarusLow.json"),
  belgiumLow: () => import("@amcharts/amcharts5-geodata/json/belgiumLow.json"),
  belizeLow: () => import("@amcharts/amcharts5-geodata/json/belizeLow.json"),
  beninLow: () => import("@amcharts/amcharts5-geodata/json/beninLow.json"),
  bermudaLow: () => import("@amcharts/amcharts5-geodata/json/bermudaLow.json"),
  bhutanLow: () => import("@amcharts/amcharts5-geodata/json/bhutanLow.json"),
  boliviaLow: () => import("@amcharts/amcharts5-geodata/json/boliviaLow.json"),
  bonaireSintEustatiusSabaLow: () =>
    import("@amcharts/amcharts5-geodata/json/bonaireSintEustatiusSabaLow.json"),
  bosniaHerzegovinaCantonsLow: () =>
    import("@amcharts/amcharts5-geodata/json/bosniaHerzegovinaCantonsLow.json"),
  bosniaHerzegovinaLow: () =>
    import("@amcharts/amcharts5-geodata/json/bosniaHerzegovinaLow.json"),
  botswanaLow: () =>
    import("@amcharts/amcharts5-geodata/json/botswanaLow.json"),
  brazilLow: () => import("@amcharts/amcharts5-geodata/json/brazilLow.json"),
  britishIndianOceanTerritoryLow: () =>
    import(
      "@amcharts/amcharts5-geodata/json/britishIndianOceanTerritoryLow.json"
    ),
  britishVirginIslandsLow: () =>
    import("@amcharts/amcharts5-geodata/json/britishVirginIslandsLow.json"),
  bruneiDarussalamLow: () =>
    import("@amcharts/amcharts5-geodata/json/bruneiDarussalamLow.json"),
  bulgariaLow: () =>
    import("@amcharts/amcharts5-geodata/json/bulgariaLow.json"),
  burkinaFasoLow: () =>
    import("@amcharts/amcharts5-geodata/json/burkinaFasoLow.json"),
  burundiLow: () => import("@amcharts/amcharts5-geodata/json/burundiLow.json"),
  cambodiaLow: () =>
    import("@amcharts/amcharts5-geodata/json/cambodiaLow.json"),
  cameroonLow: () =>
    import("@amcharts/amcharts5-geodata/json/cameroonLow.json"),
  canadaLow: () => import("@amcharts/amcharts5-geodata/json/canadaLow.json"),
  capeVerdeLow: () =>
    import("@amcharts/amcharts5-geodata/json/capeVerdeLow.json"),
  caymanIslandsLow: () =>
    import("@amcharts/amcharts5-geodata/json/caymanIslandsLow.json"),
  centralAfricanRepublicLow: () =>
    import("@amcharts/amcharts5-geodata/json/centralAfricanRepublicLow.json"),
  chadLow: () => import("@amcharts/amcharts5-geodata/json/chadLow.json"),
  channelIslandsLow: () =>
    import("@amcharts/amcharts5-geodata/json/channelIslandsLow.json"),
  chileLow: () => import("@amcharts/amcharts5-geodata/json/chileLow.json"),
  chinaLow: () => import("@amcharts/amcharts5-geodata/json/chinaLow.json"),
  cocosKeelingLow: () =>
    import("@amcharts/amcharts5-geodata/json/cocosKeelingLow.json"),
  colombiaLow: () =>
    import("@amcharts/amcharts5-geodata/json/colombiaLow.json"),
  colombiaMuniLow: () =>
    import("@amcharts/amcharts5-geodata/json/colombiaMuniLow.json"),
  comorosLow: () => import("@amcharts/amcharts5-geodata/json/comorosLow.json"),
  congoDRLow: () => import("@amcharts/amcharts5-geodata/json/congoDRLow.json"),
  congoLow: () => import("@amcharts/amcharts5-geodata/json/congoLow.json"),
  continentsLow: () =>
    import("@amcharts/amcharts5-geodata/json/continentsLow.json"),
  continentsRussiaAsiaLow: () =>
    import("@amcharts/amcharts5-geodata/json/continentsRussiaAsiaLow.json"),
  continentsRussiaAsiaUltra: () =>
    import("@amcharts/amcharts5-geodata/json/continentsRussiaAsiaUltra.json"),
  continentsRussiaEuropeLow: () =>
    import("@amcharts/amcharts5-geodata/json/continentsRussiaEuropeLow.json"),
  continentsRussiaEuropeUltra: () =>
    import("@amcharts/amcharts5-geodata/json/continentsRussiaEuropeUltra.json"),
  continentsUltra: () =>
    import("@amcharts/amcharts5-geodata/json/continentsUltra.json"),
  costaRicaLow: () =>
    import("@amcharts/amcharts5-geodata/json/costaRicaLow.json"),
  cotedIvoireLow: () =>
    import("@amcharts/amcharts5-geodata/json/cotedIvoireLow.json"),
  croatiaLow: () => import("@amcharts/amcharts5-geodata/json/croatiaLow.json"),
  cubaLow: () => import("@amcharts/amcharts5-geodata/json/cubaLow.json"),
  curacaoLow: () => import("@amcharts/amcharts5-geodata/json/curacaoLow.json"),
  cyprusLow: () => import("@amcharts/amcharts5-geodata/json/cyprusLow.json"),
  cyprusNorthCyprusLow: () =>
    import("@amcharts/amcharts5-geodata/json/cyprusNorthCyprusLow.json"),
  czechiaLow: () => import("@amcharts/amcharts5-geodata/json/czechiaLow.json"),
  czechRepublicLow: () =>
    import("@amcharts/amcharts5-geodata/json/czechRepublicLow.json"),
  denmarkLow: () => import("@amcharts/amcharts5-geodata/json/denmarkLow.json"),
  djiboutiLow: () =>
    import("@amcharts/amcharts5-geodata/json/djiboutiLow.json"),
  dominicaLow: () =>
    import("@amcharts/amcharts5-geodata/json/dominicaLow.json"),
  dominicanRepublicLow: () =>
    import("@amcharts/amcharts5-geodata/json/dominicanRepublicLow.json"),
  dominicanRepublicMuniLow: () =>
    import("@amcharts/amcharts5-geodata/json/dominicanRepublicMuniLow.json"),
  ecuadorLow: () => import("@amcharts/amcharts5-geodata/json/ecuadorLow.json"),
  egyptLow: () => import("@amcharts/amcharts5-geodata/json/egyptLow.json"),
  elSalvadorLow: () =>
    import("@amcharts/amcharts5-geodata/json/elSalvadorLow.json"),
  equatorialGuineaLow: () =>
    import("@amcharts/amcharts5-geodata/json/equatorialGuineaLow.json"),
  eritreaLow: () => import("@amcharts/amcharts5-geodata/json/eritreaLow.json"),
  estoniaLow: () => import("@amcharts/amcharts5-geodata/json/estoniaLow.json"),
  eswatiniLow: () =>
    import("@amcharts/amcharts5-geodata/json/eswatiniLow.json"),
  ethiopiaLow: () =>
    import("@amcharts/amcharts5-geodata/json/ethiopiaLow.json"),
  falklandIslandsLow: () =>
    import("@amcharts/amcharts5-geodata/json/falklandIslandsLow.json"),
  faroeIslandsLow: () =>
    import("@amcharts/amcharts5-geodata/json/faroeIslandsLow.json"),
  fijiEastLow: () =>
    import("@amcharts/amcharts5-geodata/json/fijiEastLow.json"),
  fijiWestLow: () =>
    import("@amcharts/amcharts5-geodata/json/fijiWestLow.json"),
  finlandLow: () => import("@amcharts/amcharts5-geodata/json/finlandLow.json"),
  franceDepartments2Low: () =>
    import("@amcharts/amcharts5-geodata/json/franceDepartments2Low.json"),
  franceDepartmentsLow: () =>
    import("@amcharts/amcharts5-geodata/json/franceDepartmentsLow.json"),
  franceLow: () => import("@amcharts/amcharts5-geodata/json/franceLow.json"),
  frenchGuianaLow: () =>
    import("@amcharts/amcharts5-geodata/json/frenchGuianaLow.json"),
  frenchPolynesiaLow: () =>
    import("@amcharts/amcharts5-geodata/json/frenchPolynesiaLow.json"),
  gabonLow: () => import("@amcharts/amcharts5-geodata/json/gabonLow.json"),
  gambiaLow: () => import("@amcharts/amcharts5-geodata/json/gambiaLow.json"),
  georgiaLow: () => import("@amcharts/amcharts5-geodata/json/georgiaLow.json"),
  georgiaSouthOssetiaLow: () =>
    import("@amcharts/amcharts5-geodata/json/georgiaSouthOssetiaLow.json"),
  germanyLow: () => import("@amcharts/amcharts5-geodata/json/germanyLow.json"),
  ghanaLow: () => import("@amcharts/amcharts5-geodata/json/ghanaLow.json"),
  greeceLow: () => import("@amcharts/amcharts5-geodata/json/greeceLow.json"),
  greenlandLow: () =>
    import("@amcharts/amcharts5-geodata/json/greenlandLow.json"),
  grenadaLow: () => import("@amcharts/amcharts5-geodata/json/grenadaLow.json"),
  guadeloupeLow: () =>
    import("@amcharts/amcharts5-geodata/json/guadeloupeLow.json"),
  guamLow: () => import("@amcharts/amcharts5-geodata/json/guamLow.json"),
  guatemalaLow: () =>
    import("@amcharts/amcharts5-geodata/json/guatemalaLow.json"),
  guineaBissauLow: () =>
    import("@amcharts/amcharts5-geodata/json/guineaBissauLow.json"),
  guineaLow: () => import("@amcharts/amcharts5-geodata/json/guineaLow.json"),
  guyanaLow: () => import("@amcharts/amcharts5-geodata/json/guyanaLow.json"),
  haitiLow: () => import("@amcharts/amcharts5-geodata/json/haitiLow.json"),
  hondurasLow: () =>
    import("@amcharts/amcharts5-geodata/json/hondurasLow.json"),
  hongKongLow: () =>
    import("@amcharts/amcharts5-geodata/json/hongKongLow.json"),
  hungaryLow: () => import("@amcharts/amcharts5-geodata/json/hungaryLow.json"),
  icelandLow: () => import("@amcharts/amcharts5-geodata/json/icelandLow.json"),
  indiaLow: () => import("@amcharts/amcharts5-geodata/json/indiaLow.json"),
  indonesiaLow: () =>
    import("@amcharts/amcharts5-geodata/json/indonesiaLow.json"),
  iranLow: () => import("@amcharts/amcharts5-geodata/json/iranLow.json"),
  iraqLow: () => import("@amcharts/amcharts5-geodata/json/iraqLow.json"),
  irelandLow: () => import("@amcharts/amcharts5-geodata/json/irelandLow.json"),
  irelandProvincesLow: () =>
    import("@amcharts/amcharts5-geodata/json/irelandProvincesLow.json"),
  israelLow: () => import("@amcharts/amcharts5-geodata/json/israelLow.json"),
  israelPalestineLow: () =>
    import("@amcharts/amcharts5-geodata/json/israelPalestineLow.json"),
  italyLow: () => import("@amcharts/amcharts5-geodata/json/italyLow.json"),
  italyProvincesLow: () =>
    import("@amcharts/amcharts5-geodata/json/italyProvincesLow.json"),
  jamaicaLow: () => import("@amcharts/amcharts5-geodata/json/jamaicaLow.json"),
  japanLow: () => import("@amcharts/amcharts5-geodata/json/japanLow.json"),
  jordanLow: () => import("@amcharts/amcharts5-geodata/json/jordanLow.json"),
  kazakhstanLow: () =>
    import("@amcharts/amcharts5-geodata/json/kazakhstanLow.json"),
  kenyaLow: () => import("@amcharts/amcharts5-geodata/json/kenyaLow.json"),
  kosovoLow: () => import("@amcharts/amcharts5-geodata/json/kosovoLow.json"),
  kuwaitLow: () => import("@amcharts/amcharts5-geodata/json/kuwaitLow.json"),
  kyrgyzstanLow: () =>
    import("@amcharts/amcharts5-geodata/json/kyrgyzstanLow.json"),
  laosLow: () => import("@amcharts/amcharts5-geodata/json/laosLow.json"),
  latviaLow: () => import("@amcharts/amcharts5-geodata/json/latviaLow.json"),
  lebanonLow: () => import("@amcharts/amcharts5-geodata/json/lebanonLow.json"),
  lesothoLow: () => import("@amcharts/amcharts5-geodata/json/lesothoLow.json"),
  liberiaLow: () => import("@amcharts/amcharts5-geodata/json/liberiaLow.json"),
  libyaLow: () => import("@amcharts/amcharts5-geodata/json/libyaLow.json"),
  liechtensteinLow: () =>
    import("@amcharts/amcharts5-geodata/json/liechtensteinLow.json"),
  lithuaniaLow: () =>
    import("@amcharts/amcharts5-geodata/json/lithuaniaLow.json"),
  luxembourgLow: () =>
    import("@amcharts/amcharts5-geodata/json/luxembourgLow.json"),
  madagascarProvinceLow: () =>
    import("@amcharts/amcharts5-geodata/json/madagascarProvinceLow.json"),
  madagascarRegionLow: () =>
    import("@amcharts/amcharts5-geodata/json/madagascarRegionLow.json"),
  malawiLow: () => import("@amcharts/amcharts5-geodata/json/malawiLow.json"),
  malaysiaLow: () =>
    import("@amcharts/amcharts5-geodata/json/malaysiaLow.json"),
  maldivesIslandsLow: () =>
    import("@amcharts/amcharts5-geodata/json/maldivesIslandsLow.json"),
  maldivesLow: () =>
    import("@amcharts/amcharts5-geodata/json/maldivesLow.json"),
  maliLow: () => import("@amcharts/amcharts5-geodata/json/maliLow.json"),
  maltaLow: () => import("@amcharts/amcharts5-geodata/json/maltaLow.json"),
  martiniqueLow: () =>
    import("@amcharts/amcharts5-geodata/json/martiniqueLow.json"),
  mauritaniaLow: () =>
    import("@amcharts/amcharts5-geodata/json/mauritaniaLow.json"),
  mauritiusLow: () =>
    import("@amcharts/amcharts5-geodata/json/mauritiusLow.json"),
  mexicoLow: () => import("@amcharts/amcharts5-geodata/json/mexicoLow.json"),
  moldovaLow: () => import("@amcharts/amcharts5-geodata/json/moldovaLow.json"),
  mongoliaLow: () =>
    import("@amcharts/amcharts5-geodata/json/mongoliaLow.json"),
  montenegroLow: () =>
    import("@amcharts/amcharts5-geodata/json/montenegroLow.json"),
  montserratLow: () =>
    import("@amcharts/amcharts5-geodata/json/montserratLow.json"),
  moroccoLow: () => import("@amcharts/amcharts5-geodata/json/moroccoLow.json"),
  mozambiqueLow: () =>
    import("@amcharts/amcharts5-geodata/json/mozambiqueLow.json"),
  myanmarLow: () => import("@amcharts/amcharts5-geodata/json/myanmarLow.json"),
  namibiaLow: () => import("@amcharts/amcharts5-geodata/json/namibiaLow.json"),
  nepalLow: () => import("@amcharts/amcharts5-geodata/json/nepalLow.json"),
  netherlandsLow: () =>
    import("@amcharts/amcharts5-geodata/json/netherlandsLow.json"),
  newZealandLow: () =>
    import("@amcharts/amcharts5-geodata/json/newZealandLow.json"),
  nicaraguaLow: () =>
    import("@amcharts/amcharts5-geodata/json/nicaraguaLow.json"),
  nigeriaLow: () => import("@amcharts/amcharts5-geodata/json/nigeriaLow.json"),
  nigerLow: () => import("@amcharts/amcharts5-geodata/json/nigerLow.json"),
  northernMarianaLow: () =>
    import("@amcharts/amcharts5-geodata/json/northernMarianaLow.json"),
  northKoreaLow: () =>
    import("@amcharts/amcharts5-geodata/json/northKoreaLow.json"),
  northMacedoniaLow: () =>
    import("@amcharts/amcharts5-geodata/json/northMacedoniaLow.json"),
  norwayLow: () => import("@amcharts/amcharts5-geodata/json/norwayLow.json"),
  omanLow: () => import("@amcharts/amcharts5-geodata/json/omanLow.json"),
  pakistanLow: () =>
    import("@amcharts/amcharts5-geodata/json/pakistanLow.json"),
  palestineLow: () =>
    import("@amcharts/amcharts5-geodata/json/palestineLow.json"),
  panamaLow: () => import("@amcharts/amcharts5-geodata/json/panamaLow.json"),
  paraguayLow: () =>
    import("@amcharts/amcharts5-geodata/json/paraguayLow.json"),
  peruLow: () => import("@amcharts/amcharts5-geodata/json/peruLow.json"),
  philippinesLow: () =>
    import("@amcharts/amcharts5-geodata/json/philippinesLow.json"),
  polandLow: () => import("@amcharts/amcharts5-geodata/json/polandLow.json"),
  portugalLow: () =>
    import("@amcharts/amcharts5-geodata/json/portugalLow.json"),
  portugalRegionsLow: () =>
    import("@amcharts/amcharts5-geodata/json/portugalRegionsLow.json"),
  puertoRicoLow: () =>
    import("@amcharts/amcharts5-geodata/json/puertoRicoLow.json"),
  qatarLow: () => import("@amcharts/amcharts5-geodata/json/qatarLow.json"),
  romaniaLow: () => import("@amcharts/amcharts5-geodata/json/romaniaLow.json"),
  russiaCrimeaLow: () =>
    import("@amcharts/amcharts5-geodata/json/russiaCrimeaLow.json"),
  russiaLow: () => import("@amcharts/amcharts5-geodata/json/russiaLow.json"),
  rwandaLow: () => import("@amcharts/amcharts5-geodata/json/rwandaLow.json"),
  saintHelenaLow: () =>
    import("@amcharts/amcharts5-geodata/json/saintHelenaLow.json"),
  saintLuciaLow: () =>
    import("@amcharts/amcharts5-geodata/json/saintLuciaLow.json"),
  saintVincentLow: () =>
    import("@amcharts/amcharts5-geodata/json/saintVincentLow.json"),
  samoaLow: () => import("@amcharts/amcharts5-geodata/json/samoaLow.json"),
  sanMarinoLow: () =>
    import("@amcharts/amcharts5-geodata/json/sanMarinoLow.json"),
  saoTomePrincipeLow: () =>
    import("@amcharts/amcharts5-geodata/json/saoTomePrincipeLow.json"),
  saudiArabiaLow: () =>
    import("@amcharts/amcharts5-geodata/json/saudiArabiaLow.json"),
  senegalLow: () => import("@amcharts/amcharts5-geodata/json/senegalLow.json"),
  serbiaLow: () => import("@amcharts/amcharts5-geodata/json/serbiaLow.json"),
  serbiaNoKosovoLow: () =>
    import("@amcharts/amcharts5-geodata/json/serbiaNoKosovoLow.json"),
  seychellesLow: () =>
    import("@amcharts/amcharts5-geodata/json/seychellesLow.json"),
  sierraLeoneLow: () =>
    import("@amcharts/amcharts5-geodata/json/sierraLeoneLow.json"),
  singaporeLow: () =>
    import("@amcharts/amcharts5-geodata/json/singaporeLow.json"),
  slovakiaLow: () =>
    import("@amcharts/amcharts5-geodata/json/slovakiaLow.json"),
  sloveniaLow: () =>
    import("@amcharts/amcharts5-geodata/json/sloveniaLow.json"),
  sloveniaRegionsLow: () =>
    import("@amcharts/amcharts5-geodata/json/sloveniaRegionsLow.json"),
  solomonIslandsLow: () =>
    import("@amcharts/amcharts5-geodata/json/solomonIslandsLow.json"),
  somaliaLow: () => import("@amcharts/amcharts5-geodata/json/somaliaLow.json"),
  southAfricaLow: () =>
    import("@amcharts/amcharts5-geodata/json/southAfricaLow.json"),
  southKoreaLow: () =>
    import("@amcharts/amcharts5-geodata/json/southKoreaLow.json"),
  southSudanLow: () =>
    import("@amcharts/amcharts5-geodata/json/southSudanLow.json"),
  spain2Low: () => import("@amcharts/amcharts5-geodata/json/spain2Low.json"),
  spainLow: () => import("@amcharts/amcharts5-geodata/json/spainLow.json"),
  spainProvinces2Low: () =>
    import("@amcharts/amcharts5-geodata/json/spainProvinces2Low.json"),
  spainProvincesLow: () =>
    import("@amcharts/amcharts5-geodata/json/spainProvincesLow.json"),
  sriLankaLow: () =>
    import("@amcharts/amcharts5-geodata/json/sriLankaLow.json"),
  stBarthelemyLow: () =>
    import("@amcharts/amcharts5-geodata/json/stBarthelemyLow.json"),
  stKittsNevisLow: () =>
    import("@amcharts/amcharts5-geodata/json/stKittsNevisLow.json"),
  stPierreMiquelonLow: () =>
    import("@amcharts/amcharts5-geodata/json/stPierreMiquelonLow.json"),
  sudanLow: () => import("@amcharts/amcharts5-geodata/json/sudanLow.json"),
  surinameLow: () =>
    import("@amcharts/amcharts5-geodata/json/surinameLow.json"),
  svalbardLow: () =>
    import("@amcharts/amcharts5-geodata/json/svalbardLow.json"),
  swedenLow: () => import("@amcharts/amcharts5-geodata/json/swedenLow.json"),
  switzerlandLow: () =>
    import("@amcharts/amcharts5-geodata/json/switzerlandLow.json"),
  syriaLow: () => import("@amcharts/amcharts5-geodata/json/syriaLow.json"),
  taiwanLow: () => import("@amcharts/amcharts5-geodata/json/taiwanLow.json"),
  tajikistanLow: () =>
    import("@amcharts/amcharts5-geodata/json/tajikistanLow.json"),
  tanzaniaLow: () =>
    import("@amcharts/amcharts5-geodata/json/tanzaniaLow.json"),
  thailandLow: () =>
    import("@amcharts/amcharts5-geodata/json/thailandLow.json"),
  timorLesteLow: () =>
    import("@amcharts/amcharts5-geodata/json/timorLesteLow.json"),
  togoLow: () => import("@amcharts/amcharts5-geodata/json/togoLow.json"),
  trinidadTobagoLow: () =>
    import("@amcharts/amcharts5-geodata/json/trinidadTobagoLow.json"),
  tunisiaLow: () => import("@amcharts/amcharts5-geodata/json/tunisiaLow.json"),
  turkeyLow: () => import("@amcharts/amcharts5-geodata/json/turkeyLow.json"),
  turkmenistanLow: () =>
    import("@amcharts/amcharts5-geodata/json/turkmenistanLow.json"),
  turksCaicosLow: () =>
    import("@amcharts/amcharts5-geodata/json/turksCaicosLow.json"),
  uaeLow: () => import("@amcharts/amcharts5-geodata/json/uaeLow.json"),
  ugandaLow: () => import("@amcharts/amcharts5-geodata/json/ugandaLow.json"),
  // ugandaRegionsLow: () =>
  //   import("@amcharts/amcharts5-geodata/json/ugandaRegionsLow.json"),
  // ukCountiesLow: () =>
  //   import("@amcharts/amcharts5-geodata/json/ukCountiesLow.json"),
  // ukCountriesLow: () =>
  //   import("@amcharts/amcharts5-geodata/json/ukCountriesLow.json"),
  ukLow: () => import("@amcharts/amcharts5-geodata/json/ukLow.json"),
  ukraineLow: () => import("@amcharts/amcharts5-geodata/json/ukraineLow.json"),
  // unRegionsLow: () =>
  //   import("@amcharts/amcharts5-geodata/json/unRegionsLow.json"),
  uruguayLow: () => import("@amcharts/amcharts5-geodata/json/uruguayLow.json"),
  // usaAlbersLow: () =>
  //   import("@amcharts/amcharts5-geodata/json/usaAlbersLow.json"),
  usaLow: () => import("@amcharts/amcharts5-geodata/json/usaLow.json"),
  // usaTerritories2Low: () =>
  //   import("@amcharts/amcharts5-geodata/json/usaTerritories2Low.json"),
  // usaTerritoriesLow: () =>
  //   import("@amcharts/amcharts5-geodata/json/usaTerritoriesLow.json"),
  usVirginIslandsLow: () =>
    import("@amcharts/amcharts5-geodata/json/usVirginIslandsLow.json"),
  uzbekistanLow: () =>
    import("@amcharts/amcharts5-geodata/json/uzbekistanLow.json"),
  vaticanLow: () => import("@amcharts/amcharts5-geodata/json/vaticanLow.json"),
  venezuelaLow: () =>
    import("@amcharts/amcharts5-geodata/json/venezuelaLow.json"),
  vietnamLow: () => import("@amcharts/amcharts5-geodata/json/vietnamLow.json"),
  yemenLow: () => import("@amcharts/amcharts5-geodata/json/yemenLow.json"),
  zambiaLow: () => import("@amcharts/amcharts5-geodata/json/zambiaLow.json"),
  zimbabweLow: () =>
    import("@amcharts/amcharts5-geodata/json/zimbabweLow.json"),
};

export async function loadGeoData(mapName: string) {
  const loader = geoLoaders[mapName];
  if (!loader) throw new Error(`Unknown map: ${mapName}`);
  const mod = await loader();
  return mod.default;
}
