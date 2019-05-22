const express = require("express");

const router = express.Router();

var MLPClassifier = function (hidden, output, layers, weights, bias) {

  this.hidden = hidden.toUpperCase();
  this.output = output.toUpperCase();
  this.network = new Array(layers.length + 1);
  for (var i = 0, l = layers.length; i < l; i++) {
    this.network[i + 1] = new Array(layers[i]).fill(0.);
  }
  this.weights = weights;
  this.bias = bias;

  var compute = function (activation, v) {
    switch (activation) {
      case 'LOGISTIC':
        for (var i = 0, l = v.length; i < l; i++) {
          v[i] = 1. / (1. + Math.exp(-v[i]));
        }
        break;
      case 'RELU':
        for (var i = 0, l = v.length; i < l; i++) {
          v[i] = Math.max(0, v[i]);
        }
        break;
      case 'TANH':
        for (var i = 0, l = v.length; i < l; i++) {
          v[i] = Math.tanh(v[i]);
        }
        break;
      case 'SOFTMAX':
        var max = Number.NEGATIVE_INFINITY;
        for (var i = 0, l = v.length; i < l; i++) {
          if (v[i] > max) {
            max = v[i];
          }
        }
        for (var i = 0, l = v.length; i < l; i++) {
          v[i] = Math.exp(v[i] - max);
        }
        var sum = 0.0;
        for (var i = 0, l = v.length; i < l; i++) {
          sum += v[i];
        }
        for (var i = 0, l = v.length; i < l; i++) {
          v[i] /= sum;
        }
        break;
    }
    return v;
  };

  this.predict = function (neurons) {
    this.network[0] = neurons;

    for (var i = 0; i < this.network.length - 1; i++) {
      for (var j = 0; j < this.network[i + 1].length; j++) {
        this.network[i + 1][j] = this.bias[i][j];
        for (var l = 0; l < this.network[i].length; l++) {
          this.network[i + 1][j] += this.network[i][l] * this.weights[i][l][j];
        }
      }
      if ((i + 1) < (this.network.length - 1)) {
        this.network[i + 1] = compute(this.hidden, this.network[i + 1]);
      }
    }
    this.network[this.network.length - 1] = compute(this.output, this.network[this.network.length - 1]);

    if (this.network[this.network.length - 1].length == 1) {
      if (this.network[this.network.length - 1][0] > .5) {
        return 1;
      }
      return 0;
    } else {
      var classIdx = 0;
      for (var i = 0, l = this.network[this.network.length - 1].length; i < l; i++) {
        classIdx = this.network[this.network.length - 1][i] > this.network[this.network.length - 1][classIdx] ? i : classIdx;
      }
      return classIdx;
    }

  };

};

router.get("/", function (req, res) {
  // Features:
  // var features = [0.7194016271172096,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,10.0,5];
  // var features = [0.5170303465158486,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,21.0,0];



  // Parameters:
  // const layers = [5, 4, 6];
  // const weights = [[[0.09683875594596138, 0.13955216642671686, -0.004831257794160661, 0.6570313803933325, 0.22543003735009765], [-0.03992266243101807, 0.6601342602210881, -0.3442934513731299, -0.0991338976816946, 0.14322793841307066], [-0.5677250243625583, 0.5182751073501644, -0.34533400381904905, 0.03986707146599575, -0.11691117965417151], [-0.3680573410085075, 0.12129133286544987, -0.45901480720925364, -0.08585258406177292, -0.17529146417074246], [-0.3119365976993796, 0.27974496432078727, -0.5360327511536163, -0.14493346774684587, 0.01179430853041252], [-0.5244428083176443, 0.23510006642829998, -0.48981058829212576, 0.12053115412090881, 0.35033401675774156], [-0.06243396999891413, 0.14525242610515582, -0.35479019985232757, -0.15466301213217587, 0.29016913201228234], [-0.124594055773011, 0.19587092239170117, -0.6744555304653526, 0.0008471700527127835, 0.025726254900353202], [0.0915814817214987, 0.0957409880508991, 0.21268690937711418, -0.01687983796777413, -0.18124295566444087], [-1.0545162271449227, 1.07206660093791, -0.16678148736301687, -0.2616199295034542, 0.1901893327348636], [-0.6453050372787767, 0.8483577525647894, -0.0010228391610620198, -0.390984782957983, -0.0006637810085799418], [0.48069999991277007, 0.5307495277719193, -1.150616678935308, 0.43494718122068093, -0.24366257172029424], [-0.28912738311997616, 0.12645469108211294, -0.38854641829546893, -0.1683684328937006, 0.05285414373716967], [0.06268824180430775, -0.014493183655775664, 0.10858638295077018, -0.08178718323522943, 0.32155300248197966], [-0.02489817656960044, -0.02502851498878799, -0.30594766100086435, 0.26405358510092464, 0.1210429046308239], [0.23503280125085962, 0.21142791839596134, 0.3477442859342451, -0.16506107836221803, -0.005619583912757454], [-0.26688394496719925, 0.2659312261322582, -0.12216542836671948, 0.37789105511558685, -0.2159839737591268], [0.09177281688785495, -0.10199182611477292, -0.0938722683368008, 0.19203243858332228, 0.23180068306719748], [-0.27557718791516694, -0.35858110804478166, 0.2451376396753875, 0.14893012709162667, 0.1002301636056568], [-0.14624183355383594, -0.32811731466670624, -0.03507383442659032, 0.16144005996892674, -0.19992681098658657], [0.31513636410715623, -0.1248018906463104, -0.31917432373425986, 0.23328390149480258, -0.32260172054259834], [0.19122661095623322, -0.259264381878671, -0.1706888510788007, -0.045946927401994846, -0.17883703412887325], [0.35782631002561666, 0.07387766895907052, 0.0018351092314587865, -0.15453863945877105, 0.3169219149728048], [0.09736886042041186, 0.024226005858367972, 0.2058545008943415, 0.024218596233971684, -0.14724760891710761], [0.2935421643651503, -0.014371528781393026, -0.13208832794126726, -0.28851427814627745, 0.31229687248296867], [-0.05878095482332587, 0.2010799473546681, -0.0993239303977421, -0.36374130376619973, -0.10390512875043066], [-0.3638894174134053, 0.24823022759739236, 0.35756280055745404, 0.3161389307487708, 0.06800405499534964], [-0.17999477071232264, 0.914206457241969, -2.0384440164452853, 0.5199594393753192, -0.10637382132783658], [-0.06287809981010109, -0.11878006735535517, -0.09201267113999129, -0.015540835345834659, 0.34144413668321094], [0.27919416358592447, -0.34244818621668677, 0.12888247068635483, 0.2790712788778558, -0.15159311506268625], [-0.2563635395706565, -0.10577269500886423, 0.2843847209963774, -0.27100746951698423, 0.038671251860931066], [0.01742338773266033, -0.3221338874213334, 0.08309106630411023, -0.23884771393496756, 0.31316857296361306], [-0.07156275338444604, -0.7806994769427418, 1.2468637846289474, 0.2583484216833918, -0.15448470604195297], [-0.23757481720956494, -0.22886794585356013, 1.1118712473054688, 0.3914896085229147, -0.26983275117669503], [-0.25014280321476956, 0.33433083760525445, -0.1548076788073014, -0.0663289479662007, 0.08757456191416864], [0.06350374508081867, 1.3450313695416365, -1.6679274058962077, 0.003339074284405499, 0.19675625658339801], [-1.2676037547461227, 0.9231343712926577, -0.630850259510478, -0.6216136411112253, 0.20731088956855878], [0.1529443756038818, -0.08286967322959174, -0.32909902457803475, -0.17358741477544273, 0.10940310776706465], [0.7046027417976485, 1.3395824233604137, 0.24830176106316298, 0.08370281013984324, -0.19104372314381887], [1.6703088171753602, -2.3235474702997165, 0.12059064516298312, 2.7086027799159407, 0.10827128826653942]], [[2.1644581890130503, 0.13353208160229882, 0.21350496278266862, 0.6480630163998986], [-1.3954067764024347, -0.5832179850511183, 0.4758692987236252, -0.8055322211610434], [1.589257849639544, -0.27087730289150785, -1.9712496115182507, 2.4389530246195736], [2.8648431679576913, -0.08547149064479252, 1.10529674028971, 0.3635761352583198], [-0.31351253137424484, 0.21369878794531064, -0.035922291952595574, -0.2771337942546268]], [[-5.915860276800064, -3.404797840361064, -1.0238492771791876, 2.521594120122528, 1.9410799903040064, 2.9970113310828], [-0.15576885725494014, -0.1435983838787508, 0.42533471253356236, 0.001228440836543644, 0.22180562530274794, -0.6132632435857919], [2.395758402340087, 2.0798305378910813, 1.0122777720118277, -2.185602988452941, -1.4820667319473928, -3.2308231083717023], [-1.9045007147566257, -1.5881271194785345, 1.3832521211396942, -1.5115236902161429, -0.16730623867114794, 1.3206824015949032]]];
  // const bias = [[-1.4031563740888433, 1.9680829696242415, -2.1684772482193733, -0.4220886432746997, -0.04151573480199159], [-0.9909943334895941, -0.07782299613645761, 1.679994090291464, -0.5426117221008456], [-0.24727078977778846, 2.8118195401093735, 2.3101409843375795, -0.3449147698337949, -1.083636832385673, -2.770636214185344]];

  // 86 sin moviles
  // const layers = [5, 4, 6];
  // const weights = [[[-0.8059715509974685, -0.14896820725710863, -0.17608487582605503, 0.04666313567425662, 0.8494074935188388], [-0.43548625405147845, -0.21861874354795446, 0.12321853758708286, -0.019740665214351385, 0.7897047036862931], [-0.3119799495524076, 0.018982709325166335, -0.1528526071052257, 0.10739204175915203, 0.7611979843483334], [-1.4971441043061977, 0.557365641745927, -0.2942332320664479, -0.16027349232226745, 0.9826177771874848], [-0.1697954540635221, 0.2332428830520101, -0.11086829539287871, 0.19050094115046956, 0.2193128048241041], [-0.07607077138028497, 0.15339549701395755, -0.12539225843982865, -0.10904049490312127, 0.39511650482967386], [-0.21731159954224438, -0.18839382240562028, -0.031940627096486526, -0.304181366680092, 0.35375962948557765], [-0.1752284352838353, 0.3607301698891477, -0.24415616421913477, 0.08212994598596986, 0.2479579957596311], [0.5029088898478846, -0.28171337529991736, 0.13250653117672284, 0.46340813897524064, 0.4394860159277256], [-1.3746510114502877, 1.129600705077749, -0.21474814300785977, -0.5395192977951662, 0.7343628968963773], [-1.2897890644309173, -0.2947608690569473, 0.20348546302368178, -0.2964109756450337, 1.4653911271955684], [-0.2594143561737298, 0.4881885287880956, 0.3508360965294609, -0.2703513272757969, -0.003240868628938554], [-0.5860156167333288, 0.31117419894975723, -0.06615670352760507, 0.12387431905515511, 0.712230875991865], [0.26557985169357884, -0.12658314332250056, 0.23094994639621774, 0.1701001997090529, 0.20424796183084043], [0.3577730503036807, -0.23860732677330945, -0.2432225236767659, -0.31934919217107843, -0.003752717217135553], [0.1801414704707725, -0.27253691188106205, -0.06323905719556416, 0.0370669377059371, -0.24819527506522238], [0.19979769363490188, 0.0984053360472287, 0.20551498516030664, -0.022640660892212564, -0.22839052628238982], [-0.33101945292453333, 0.16772860576966855, -0.2503530810435432, 0.23460114912848934, 0.06452194075102055], [-0.11883148748065916, 0.23728234246535634, -0.06433189514421496, -0.3427042158371057, 0.09186604085133439], [0.08960485979532626, -0.33470160786138353, 0.3028043517875859, 0.11515685245290358, 0.2731064729153738], [0.10407085717099432, 0.23547095832727738, -0.18468053993952102, -0.339702968121549, 0.3034909641215601], [0.08975503913204608, 0.22807524692883524, 0.34384926003050525, 0.28473622491586525, -0.25481234480962894], [0.2979196492321123, -0.20735154546791074, -0.29132747083335325, -0.13594529736055108, 0.19654464407041353], [0.20197344366822642, 0.06610709788755358, -0.002065017750919436, 0.0033133600761584042, -0.021649584034799253], [-0.2836653701921953, 0.059586683219731214, -0.004644480869625417, 0.06684463640889003, -0.3586137317275975], [-0.21064923216261525, 0.0638146936237569, 0.11032401603579813, -0.026230879896163527, 0.24706145525435558], [-0.14870153035256736, 0.23759935184995298, 0.30793877037442335, -0.1418958375613181, 0.11251296653362149], [-0.5433708209851448, 2.9214533134625578, 0.18334282686502565, -1.7430046011008138, -4.1600721939665135], [-0.2037963593228212, 0.07598357303739926, -0.17091584675171964, 0.3128380291345445, 0.0029580439503576034], [0.21911275548664338, 0.2198180422278743, -0.014954134605222725, -0.03765725311984003, -0.10423903674341883], [0.08827923829432968, -0.22099296158662646, 0.06410826118484006, -0.14420162087040747, -0.057637150286757394], [0.042918641662011835, -0.2193362409697892, 0.030710751919966004, 0.15226135235087485, -0.060519901019199636], [0.3805124068057912, -1.6436483493831293, 0.14359530360511466, 0.8378413635398566, 2.1823210856975575], [0.580072725898775, -1.3829769649432102, -0.05591985543232205, 0.7771578559639046, 2.1581296141497335], [-0.12082229842609556, 0.26030457521086015, 0.31588770634304336, 0.2886048629372152, -0.0016520753587118452], [-2.0802029933049027, 1.1403206211831012, -0.2504670940400359, -0.28204790673281543, 1.6738905749962023], [-0.5540854224664338, 0.1098660482964575, -0.3370359132674931, -0.3496329913064935, 1.5355627403421293], [-0.2593101710521571, 0.039456875769337485, 0.20313179152206265, -0.26426530893334804, 0.28722208015499806], [-1.1422232465236872, 4.8205200080352135, -0.7877981017319817, 3.768148360475078, 0.7287951409847189], [3.3333939254757814, -1.6208421409171114, 0.04747454887176793, 1.415762371845344, -3.17046609689973]], [[-1.6495135847905136, -0.5459932020962959, -1.2798311563680334, 1.713586502626841], [2.0365864278604167, -0.8004842743075382, -0.30529441460201984, 1.4551724060142626], [0.7183913202778479, -0.5992970976841243, 0.050945682956965166, 0.09330730512101518], [-3.5989539629745324, -0.29762481867138507, -2.00107236364536, -1.2481660805324233], [4.951935610450184, -0.6154671372860807, -0.887688071307704, -3.159977247234994]], [[3.370440676148736, 2.3510506932976645, -2.547576266301239, -0.37499124075045553, -0.8713787270643487, -1.470726311449589], [-0.2579277645358974, -0.7271488701384506, -0.009632568964908245, 0.2703321968287061, -0.25135427266542615, 0.20302131222995318], [0.006310862331803521, -0.3391430257555299, 0.3925278341307983, -0.3648405011644786, -0.05582449131457693, 0.33196117648451556], [-0.02591376984468102, -0.8602693961182831, -3.327359762025045, 1.6457871546128395, 1.5351815766664298, 1.3127812709273945]]];
  // const bias = [[-2.3595882098369594, 0.8350378995279503, -0.18161275727680867, -0.40064885023650926, 3.218682502967455], [2.2503105410523023, -0.6860902193988101, -0.5677692276958485, -0.30955128553774497], [-14.594524974934668, 1.4772376316261882, 8.057661897697225, -0.1367670626791799, 0.8023819024987912, 3.5939837574411224]];


  // var features = [0.18992951504663824,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,40.0,0]
  // // 91%
  // // Parameters:
  // const layers = [3, 4, 6];
  // const weights = [[[-0.07687577149115812, 0.796146110447301, -7.352954819866199], [-0.03607698374743478, 0.33782888074176604, -3.5884525299942993], [-0.20064956935388834, -0.5022625413816036, -4.381839656988684], [0.181116671682232, 0.53891271364261, -2.712484932364259], [-0.21551877224259933, 0.15518119126204352, -1.6186321996784165], [0.3226977475512713, 0.04295284584907162, -2.2991491415206786], [-0.263678579396855, 0.06780699444439357, -1.9865921434977416], [0.057295966309594375, 0.37783234419552264, -1.2959196320458857], [-0.20748662624036146, -0.4918611061955175, 0.19962510172776113], [0.04397045037674421, -1.9380588223690822, -0.27862318452087637], [0.22048614670640235, 0.03697600850381509, -1.187638119318053], [0.2520008877756272, -0.33675836311511526, -0.458248553927088], [-0.24587907997143796, -0.071002443277061, -0.23673698092833273], [-0.13658479344314642, 0.004069210133941775, -0.07094346296890204], [0.04931087541093649, -0.2102077285374751, 0.06425963106089688], [0.2538334016012867, 0.19292828633018086, -0.2603056502587832], [-0.22496460895503254, -0.03057578306961956, -0.15040453316719313], [-0.1834048418773695, -0.2605478339392317, 0.2519556157099366], [0.038549045194638594, -0.15847686825297352, -0.10486794512085057], [0.2693750556566946, -0.26036593976991457, -0.23564627265884658], [0.2277380060223111, 0.13427975611075904, 0.17718157465302883], [-0.036704195585153615, -0.1966695115633064, 0.04806660352008447], [-0.23535995421297254, -0.21193319907898397, 0.01627644949843642], [-0.11588260333806345, 0.19881850365191833, 0.02484142254646909], [-0.14658162621130183, -0.24244086074746568, 0.1817072598286136], [0.08147644056556463, 0.22724432550093562, 0.013292994839244059], [-0.030483348733446314, 0.20538587999039915, -0.23208101256748492], [0.32002500712948057, -0.3543333428867968, -0.4443913737999376], [0.27640927729827763, -0.009044629800667022, -0.20278866092316059], [-0.06956881554921596, 0.023433684455310255, 0.15444422744541364], [0.28140709248929696, -0.2853601825133854, -0.0824830744543036], [-0.236314211234816, 0.027258149039887065, -0.6956393946225502], [-0.01688240554893706, 2.1346389444445855, -10.438447064243585], [-0.016693285388003444, 1.5667745931211452, -4.742600701621081], [0.16277355887487027, 0.43876468963048115, 0.06293962886118157], [0.08570312447607858, -1.5151483221152207, -1.437361655662962], [-0.27273405847446885, 0.4236455435903573, -5.016221907823825], [0.05846162222182829, -0.41463808497927274, -0.23065385350054307], [0.28613739881608125, 0.22506405648266264, -0.16923103029299966], [-0.23259572658627173, 2.524053036461494, -9.202746365353619], [0.07967540489948725, -0.020791470605386695, -0.17722188257706853], [-0.1396394513844209, -0.3109257622999911, 0.15547684023124816], [-0.13094206645362583, 0.13618728680117254, -0.41842998130518977], [-0.1461833348493792, 0.018849399919884584, -0.2551189067817148], [-0.2694914129868415, 0.25000101129640895, 0.06176000974842695], [-0.0938364000313256, -0.21371688556140395, -0.28125887861630144], [0.024880311841426406, -0.21944808183190664, -0.2020860860159048], [-0.19234156674821296, 0.12228460549718663, -0.15945115128488382], [-0.12720474935758258, 0.3507734030519268, -1.4332016995764219], [-0.2647993058254548, 0.11067325749327689, 0.11370244067655784], [0.5050415848455206, -0.7018018099486709, -7.291327547255232], [-0.16219021128257166, 1.3691219803694035, -4.541052092662945], [0.26906370698203264, 0.3766470567734795, -1.1428021303361788], [-0.046064980786130125, 0.05655823490604938, -2.141323083227727], [-0.03999332089462349, -0.2283489678521943, -0.2773228260937218], [0.07078907046942501, 0.009512908430783293, -1.089108552009292], [0.026180738951413877, -0.09843682045554365, -0.41366419411368166], [-0.24455315672859723, -0.028922095994457442, -0.8317557012227568], [0.2712730688695203, -0.0869199788566591, -0.797611362851496], [-0.27629110749568897, 0.2690508328117893, -0.18087862379536412], [0.0854213758082317, -0.2649592732862519, -0.37981101456760014], [0.0390764087017781, -0.1437975074443845, 0.0014942142303540095], [0.015406883301994662, 0.05965081838837415, -0.09991555994145188], [0.0319973115632904, 0.013678146331655507, -0.03793236246488984], [0.21850309558607417, 0.03516600821819191, -0.07060076256780011], [0.14594741319942614, 0.7628085552630911, -9.212762228607794], [0.14791795450020295, 0.5130656641268749, -8.760164429312475], [0.11078756807441449, -0.2351765771520585, 0.05460183478575168], [-1.6397927700539265, -0.10852215379633846, -34.94378949150086], [1.2866288592948594, 14.004018655822973, -91.77006879075452]], [[0.1563214551296518, -0.6751781642430003, -0.777066061817774, 0.0152841041913465], [9.98872409843116, -1.0998702973580714, -0.10889458299655502, -8.017750545614156], [9.311235612774324, -0.30442631930819347, 0.10054278045135012, -8.676232402388916]], [[-0.1999198458950299, -0.03254406074821269, -0.0341218897317157, 0.010904195502750232, -0.02313201783669803, 0.034893167741018284], [-0.7113211560436222, -0.10678816058036371, 0.5314734951647045, 0.7682656559872834, 0.6173891212041539, 0.6515278625669757], [0.016971518450540204, 0.07499476972955366, -0.4994514476081977, -0.5940046612337367, 0.09509052527250071, 0.10268392126542304], [10.032840606931295, -0.9946454948232291, 2.0815319697230956, -4.254894720251847, 2.820110678947846, -10.691252552156605]]];
  // const bias = [[0.0810561537061654, 1.0023047814778034, -18.330050416467355], [-21.23503888002213, -0.7435643997428217, -0.44098089012681085, 14.796409852659677], [15.375833602521736, 4.896030110388993, 8.40646860827136, -9.109719599653474, 3.917707506655101, -23.10378655257917]];



  // var features = [0.48866052445074415, 0.01070863208864885, 0.7503059975520195, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 25.0]

  // Prediction:
  
  // var prediction = clf.predict(features);
  // console.log(prediction + " " + clase[prediction]);
  res.render("home/index");
});

router.post("/", function (req, res) {
  console.log(req.body);      // your JSON
  var hora = parseInt(req.body.time.replace(":", "")) / 2359;
  var codDane = 0.0000105516397248132 * (parseInt(req.body.muni) - 5001)
  var barrio = parseInt(req.body.barrio)
  var edad = parseInt(req.body.age)
  var dia = parseInt(req.body.day)
  var movila = parseInt(req.body.movila)
  var movilv = parseInt(req.body.movilv)
  var sexo = parseInt(req.body.sex)
  var features = [hora, barrio, codDane, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, edad]
  features[67 + sexo] = 1
  features[3 + dia] = 1
  features[36 + movila] = 1
  features[51 + movilv] = 1
  var clase = ["Amenaza", "Homicidio", "Hurto", "Hurto_Vehi", "Hurto_Moto", "Lesiones_acc"]
  const layers = [5, 4, 6];
  const weights = [[[-0.6833493774265691, -6.8775259365786665, -2.2736921587506995e-274, 1.05105669939702, -4.397358159e-314], [0.8577955270220016, -0.00805219891586985, -1.0653551374101777e-280, 0.20286408932767333, -4.398887818e-314], [-0.18727571310512328, 0.0031058542838484633, -4.082999315590484e-278, 0.6198595636025044, -4.4048978064e-314], [0.620895457278191, 0.34260082522142865, -1.7647590972862954e-284, 0.16125792522609902, -4.3847563705e-314], [0.6157393640442238, 0.3366682559825571, -9.461531073398166e-292, 0.08426118187128806, -4.4153384174e-314], [0.6032846783107573, 0.3398874279803414, -4.3756536735e-314, 0.09405892193043175, -4.39639564e-314], [0.6346060531404654, 0.3300195818203785, 9.342477082696818e-272, 0.07743033272104766, -4.4004607332e-314], [0.6052903902027331, 0.3383961410457887, -1.2847566688165885e-272, 0.10730487527602181, -4.420933296e-314], [0.6484384677665755, 0.34768888359892036, 1.1545664926811077e-285, 0.1523028158630262, 4.4134309604e-314], [0.7149215547599488, 0.359583739601279, -2.1143985909953917e-280, 0.34722252532591374, -4.392162454e-314], [2.0685225647809906, 0.7325453224389421, -1.6531784969465086e-294, -1.654834072638963, -4.402491509e-314], [0.33396294167825186, 0.6338105118437058, -4.4092415367e-314, -0.4030188428565122, 4.3952279694e-314], [-0.6605310553646566, 0.667984648038876, 3.500838217591542e-271, -0.08998522945272165, -4.4016256215e-314], [2.46005442477637, 0.686893653856831, 2.953820058783649e-273, -0.4987363906871893, 4.375099055e-314], [1.378113734297807, 0.7178260707618075, -5.432091309165311e-286, -1.6657331737760341, -4.3930191086e-314], [0.5374889603485371, -1.176168439355303, -4.380933235e-314, -1.024972525144743, -4.4061153106e-314], [5.663416716699718, 1.1764268717851756, -4.376608224e-314, -0.7259725759393102, -4.322727148e-314], [4.788422585881812, 0.47970268527996124, -4.324527476e-314, -0.6165544116029639, -4.4117297936e-314], [4.727423977851003, -0.6877862453715485, -4.3860187755e-314, -0.49534187698372534, 4.4003739674e-314], [4.8496359500803825, -0.4166204139368129, 4.419694543e-314, -0.4120074004916309, -4.378312553e-314], [3.4672911846522707, -1.8442642977532686, 4.37858006e-314, -2.262712963238108, -4.3995797944e-314], [4.617710429349205, 0.17845270252792278, 4.3985198853e-314, -0.5127878355031479, -4.418426952e-314], [4.462771448730329, -0.5045716981978416, -4.3802890685e-314, -0.6904864573322194, 4.404115143e-314], [4.175296963418711, -0.23368260384673345, -4.423417379e-314, -0.9343446314031209, -4.4021262325e-314], [4.409216367e-314, 4.3751501534e-314, 4.390465461e-314, -4.3943063037e-314, -4.421596308e-314], [3.51846451535435, -0.9998065279528043, 4.4205299486e-314, -1.9894001419844165, 4.4184299877e-314], [3.5403646093527548, -1.3502403087087305, 4.3852414244e-314, -0.9959144327712509, 4.3894069433e-314], [4.3802759145e-314, -4.3766507216e-314, -4.39201776e-314, 4.403917327e-314, -4.4226870787e-314], [3.3680033292526246, -1.2037461353286656, 4.3879304063e-314, -0.8827734450206867, -4.4049167785e-314], [1.097761860655534, -0.7107052489233581, -4.3807896795e-314, 2.451715446322883, 4.3958403894e-314], [0.9812779596027066, 4.47293327728174e-19, -4.3919145517e-314, -1.4521949574888948, 4.410050255e-314], [2.091049111520733, 2.004818946024375e-173, 4.376124182e-314, -1.8975876465504402, -4.3943456393e-314], [4.404420215e-314, -4.402426751e-314, 4.4102489563e-314, -4.393540589e-314, -4.4051427997e-314], [-1.5448098150851104, -0.24045946223102585, -4.403139091e-314, 1.0415418540777535, 4.416818496e-314], [-2.5871022965530175, 6.551174228839641e-68, 4.387916367e-314, 4.863881976921044, 4.402936089e-314], [-3.2268116413425556, 0.7772628693270888, -4.4111115554e-314, 4.449995840935094, 4.3914590943e-314], [-3.6330299902135614, 6.809124894605241e-193, -4.398805985e-314, 4.016352008759814, 4.4082775e-314], [0.8758929460243379, 0.5896843072283937, 4.301513966965654e-271, 0.42087502033030844, 4.40048097e-314], [0.38968934951119805, 0.5505665569387477, 4.4217026786e-314, -0.38085387599719184, -4.3836901373e-314], [1.2360863420396455, 0.6086460773761723, 4.4044524675e-314, 0.04360637868920193, 4.4124726153e-314], [0.5742233693764864, 0.38720299509123596, -4.389650166e-314, -0.41012633095747364, 4.41651178e-314], [-0.40694623260204427, 0.1937309123114006, -4.400210554e-314, -0.2271573736444296, -4.3943012445e-314], [0.36534620474637813, 0.4539001256506446, -4.3994659617e-314, -0.39721133521216456, -4.4203241643e-314], [1.5845595400288466, 0.5937405705740584, 4.42267696e-314, -1.0160894597554115, -4.3777299824e-314], [1.0819020051042536, 0.6065389340218041, 4.4062549454e-314, -0.9416955516497378, -4.3826037937e-314], [-0.10126268961094648, -0.9950714185209566, 4.3987583016e-314, 0.16049104695475674, 4.406653866e-314], [0.8342272784740269, 0.5539416767265738, -4.414954295e-314, -0.391864974744123, -4.3778860597e-314], [0.9180209635637573, 0.7168137638290407, -4.416062773e-314, -0.11335273557500594, 4.413893374e-314], [1.5776366764694514, 0.5841234347361445, -4.4030740796e-314, -2.7543949390440807e-118, 4.375444727e-314], [1.3415227982945805, 0.6706134417352327, -4.3949920827e-314, 0.21543004268457358, -4.398329152e-314], [-0.5428437305040535, 3.208308883066307e-102, 4.415850791e-314, 1.5462537736521473, -4.393965438e-314], [0.4477716655772615, 2.9714454080795415e-41, -4.3988932566e-314, -4.515275454137486e-234, -4.384097026e-314], [0.9729826042737397, 0.6026549230181403, 1.7015321687172097e-270, 0.259949806699258, 4.3978978527e-314], [1.0141685895952555, 0.493463483000333, 4.378580945e-314, 1.856423521756806, 4.3980927596e-314], [0.6255939625111931, -0.10952068667827429, -4.405450148e-314, -1.6271494939621505, -4.4153920453e-314], [0.15377687419322406, -0.20324576729046123, -4.3812369156e-314, -3.624265372570654, 4.4152974376e-314], [0.23973466019517833, 0.3151918743057264, 4.4032300305e-314, -1.5691151615952417, 4.4242932584e-314], [0.6237091803602226, 0.542794056882061, 4.3929202006e-314, 0.5876175537881315, 4.3992260276e-314], [0.8176174567103123, 0.607744009141816, 4.423666799e-314, -0.8233755376884697, 4.408908007e-314], [1.432282889777892, 0.6377361196660827, 4.3842070644e-314, -2.3733003097087924, -4.4030738267e-314], [1.1216054575872991, 0.5891559526858633, -4.412403304e-314, -1.47221823323641, 4.3776600385e-314], [2.3641994976155813, 0.6776236523577241, 4.416923475e-314, -1.5938431393613948, 4.4176186134e-314], [0.9034607654052539, 0.5864190929093462, 4.4000165327e-314, -1.6978811793091069, -4.3849551984e-314], [2.5970915990595143, 0.5872300968172204, 4.384163808e-314, 0.591686286539514, 4.4019891273e-314], [1.8778307857023258, 0.5473539578149622, -4.396523133e-314, -1.809642720307914, 4.4038224666e-314], [1.0852341005129855, 0.7460690431919457, 4.4001756455e-314, -1.1619034962299377, -4.4140384477e-314], [1.8552978258513577, 0.6198738512870923, 4.412226863e-314, -1.7123069942794211, -4.383322331e-314], [1.2840874362156083, 0.4599267115214142, -1.4817599256268988e-279, 0.6389507295791711, -4.398018136e-314], [0.919554881459144, 0.46925588403350904, -3.7813130851743847e-271, 0.09888031420010307, -4.4110055645e-314], [4.414844763e-314, 4.387341638e-314, -4.410038113e-314, -4.422289676e-314, 4.3975485127e-314], [-0.0012398805795015638, -0.0018228043630885067, -1.5095676858371484e-279, -0.006148049732418858, -4.4232554834e-314]], [[0.4471041817067921, -7.435959997270432e-299, -4.3184724313093155e-232, 1.3844601588418344], [13.052599507294966, 9.431240959259724e-282, 5.025672480301357e-237, -2.310133213852127], [-4.407662171e-314, -4.3931285145e-314, 4.414441795e-314, -2.8718190511340774e-276], [-0.5827728309096479, -4.3811753195e-314, -1.5491071373541824e-238, -0.02263120282231612], [-4.377121989e-314, -4.3921611893e-314, 4.3839264035e-314, 4.3998781627e-314]], [[1.099904363695739, 1.2884552465602033, -0.9031831954133309, -4.188850711296646, 1.0878813830444631, -3.656972481340179], [3.2431948575456683e-299, -4.363751956e-314, 3.5149644774276877e-298, 2.395402967528255e-305, 1.4304832626245e-311, 4.4116890667e-314], [1.2515793089318644e-251, -1.1304475321453713e-260, 2.7324100004200875e-262, -6.985376111117764e-259, 3.2397473135275726e-250, -9.360102861857182e-262], [-2.5076459236848105, -0.39389019095987027, -0.03371884141978682, 1.188281399931557, -1.6861409659403241, -1.15375433275307]]];
  const bias = [[1.5252783259248845, 0.6998792186297506, -0.21423196593650307, 0.2611281570952467, -0.10379073542997866], [0.9220342047094882, -0.35723011947329125, -0.6344030737537659, 1.6212858850655012], [6.741134387913518, -11.54223330182336, -0.795288507099331, -5.449554604420343, 2.8580161763402985, 11.662602239765167]];
  var clf = new MLPClassifier('relu', 'softmax', layers, weights, bias);
  var arma = ["ARMA BLANCA / CORTOPUNZANTE","SIN EMPLEO DE ARMAS","NO REPORTADO","ARMA DE FUEGO","CONTUNDENTES","ESCOPOLAMINA","CUERDA/SOGA/CADENA","BOLSA PLASTICA","CINTAS/CINTURON","ARTEFACTO EXPLOSIVO/CARGA DINAMITA","GRANADA DE MANO","COMBUSTIBLE","ALMOHADA","ARTEFACTO INCENDIARIO","MINA ANTIPERSONA","SUSTANCIAS TOXICAS","MOTO BOMBA","PRENDAS DE VESTIR","QUIMICOS","LLAVE MAESTRA","PERRO","PALANCAS","JERINGA","-","VEHICULO","MOTO","BICICLETA"]
  var response = []
  for (var i = 10; i < 36; i++) {
    var array = features.slice(0)
    array[i] = 1
    prediction = clf.predict(array);
    response[i-10]={arma: arma[i-10],predi:clase[prediction]}
    console.log(i+" "+prediction + " " + clase[prediction]);
  }
  res.render("home/result", {data: response});    // echo the result back
})

module.exports = router;
