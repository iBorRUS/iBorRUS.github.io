var windowmain;                                     // указатель на окно с открытым приложением
var errmodalopen = false;                           // открыто окно с ошибками
var modaltitle = "";								                // Заголовок текущего окна
var editjob = "";									                  // изменение, удаление задания
var speech = new SpeechSynthesisUtterance();        // Возвращает новый экземпляр объекта т.е. включает динамики (массив)
    speech.lang = 'ru-Ru';                          // Язык для диктовки текста
    speech.volume = 1;                              // громкость речи
    speech.rate = 1;                              	// темп речи
    speech.pitch = 1;                               // диапазон речи
var voicestart = 0;                                 // пауза ожидания голосовой команды
var errcommand = 0;
var recognizer = new webkitSpeechRecognition();   	// Создаем распознаватель
var micon = false;                                  // микрофон выключен
var recognizing = false;                            // идет (ожидание) процесс записи голосовой команды
recognizer.interimResults = true;                 	// true = распознавание началось ещё до того, как пользователь закончит говорить
recognizer.lang = 'ru-Ru';                        	// Язык для распознования
recognizer.continuous = true;                     	// когда пользователь прекратил говорить, распознование не закончилось


function speechmic () {                             // Включаем микрофон
  micon = true;
  if (!voicestart) {
    document.getElementById('micbutton').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
    voicestart=0;									// количество пауз ожидания
    strvoice("Произнесите команду"); 
    recognizer.start();
  } else {
    document.getElementById('micbutton').classList.remove("miganie"); // убрать МИГАНИЕ МИКРОФОНА
    recognizer.stop(); micon = false;
  }
}

//-----------------------------------------------------------------------------------------------
speech.onstart = function() {                       // когда идет текст, 
    recognizer.stop();                                //                  отключить микрофн
    recognizing = false;                              //
}                                                   
speech.onend = function() {                         // когда текст закончился, 
  if (micon) {
    if (!recognizing && voicestart < 3) {
    	recognizer.start();             //                        включить микрофон
    } else { voicestart = 0; }
    recognizing = true;                             
  }
}
//-----------------------------------------------------------------------------------------------

recognizer.onresult = function (event) {            // Вызывается если результат — слово или фраза были распознаны положительно
  var result = event.results[event.resultIndex];    // содержит все данные, связанные с конечным результатом распознавания речи
  if (result.isFinal) {                             // результат является окончательным
  	voicestart=0;                                   // количество пауз ожидания
    voicecommand((result[0].transcript).trim().toLowerCase());	// удалиь пробелы слева и справа, все буквы - мленькие
  } 
}

recognizer.onstart = function(){                    // вллючился микрофон
  //document.getElementById('micbutton').classList.add("miganie");    // добавить МИГАНИЕ МИКРОФОНА
  //if (!voicestart) strvoice("Приветствую вас, " + myname);
  //if (!voicestart) strvoice("Произнесите команду"); 
  //voicestart = true;
}

recognizer.onend = function(){                      // Закончилось время ожидания (примерно 15 сек)
  if (recognizing) { 
  	if (++voicestart < 3) {
    	strvoice("Я жду команду");
    	recognizer.start();
	} 
  else {
		document.getElementById('micbutton').classList.remove("miganie");    // убрать МИГАНИЕ МИКРОФОНА
		strvoice("Я устала ждать. Отключаюсь");
    	recognizer.stop();
	 }
  }
}

//----------------------------------------------------------------
// ПРОИЗНЕСТИ КОМАНДУ 
//----------------------------------------------------------------
function strvoice(textvoice){
  speech.text = textvoice;					  		// текстовая строка 
  window.speechSynthesis.speak(speech);         	// произнести тестовую строку
}
  
//----------------------------------------------------------------
// АНАЛИЗ ГОЛОСОВОЙ КОМАНДЫ 
//----------------------------------------------------------------
function voicecommand(strcommand) {
  var modal = document.getElementById('myModal'); // указатель на модальное окно с ключевыми фразами
  var modaldate = document.getElementById('myModaldate'); // указатель на модальное окно с найденными (по дате) заданиями
  
  var today = document.getElementById("today");   // указатель на дату в строке с заданием
  var job = document.getElementById("job");       // указатель на задание
  var hours = document.getElementById("hours");   // указатель на часы
  var minutes = document.getElementById("minutes");   // указатель на минуты
  document.getElementById('voice').innerHTML = strcommand;

  var voicejob, pozdate;                          // поиск заданий по указанной дате
  if (strcommand.indexOf('задани') >= 0 && (pozdate=strcommand.indexOf(' на ')) >= 0 ){
    document.getElementById('dtjobondate').classList.add("miganie");    // добавить МИГАНИЕ
    switch (strcommand.substr(pozdate+4, 6)) {
      case 'сегодн': voicejob = 'сегодня'; break
      case 'завтра': voicejob = 'завтра'; break
      case 'послез': voicejob = 'послезавтра'; break
      default :
        voicejob = strcommand.substr(pozdate+4, 20);
      break
    }
    var poiskjob=0, kodcheck=0;                             // количество найденных заданий
    var tabledate = document.getElementById('tabledate'); // указатель на таблицу с найденными (по дате) заданиями
    var rowCount = tabledate.rows.length;
    if(rowCount) for (var x=rowCount-1; x>0; x--) tabledate.deleteRow(x);
    var trStroka = document.getElementById('myTable').getElementsByTagName('tr');   // получить массив всех строк
    for ( var nrow = trStroka.length-1; nrow > 0; nrow--) {       // цикл по количеству строк в таблице (начиная с последней записи и до 1-й)
      var tdStroka = trStroka[nrow].getElementsByTagName('td'); // получить массив всех колонок в строке
      console.log('nrow= '+nrow)  
      if (twodates(tdStroka[1].innerHTML, formatDate(voicejob)) == 0) {
        poiskjob++;
        trStroka[nrow].getElementsByTagName('input')[0].checked ? kodcheck = 1 : kodcheck = 0;
        addRowTable("tabledate", 1, kodcheck, tdStroka[1].innerHTML, tdStroka[2].innerHTML, tdStroka[3].innerHTML);
      } else if (poiskjob) break;
    }
    if (poiskjob) {
      strvoice('Смотрим задания на '+voicejob+', их '+poiskjob);
      //var modaldate = document.getElementById('myModaldate'); // указатель на модальное окно с найденными (по дате) заданиями
      document.getElementById("modal-title-date").innerHTML = "ЗАДАНИЯ НА "+voicejob; // заголовок модального окна
      document.getElementById("okbuttondate").innerHTML = "Закрыть"; // заголовок подтверждения изменения
      modaldate.className = 'modal';                                // поменять класс на первоначальный
      modaldate.style.display = "block";                            // показать окно на экране 
      modaltitle = 'ПОИСК ПО ДАТЕ';
    } else { strvoice('На '+voicejob+' никаких заданий нет!'); }
    return
  }

  switch (strcommand) {
    //--------------------------------------------------------------------
    // АНАЛИЗ ОСНОВНЫХ КОМАНД (команды первого уровня)
    //--------------------------------------------------------------------
    case 'выше':
      window.scrollBy(0,-200);                    // прокрутка окна вниз
    break

    case 'ниже':                                  // прокрутка окна вверх
      window.scrollBy(0,200);
    break

    case 'закрыть программу':
      modaltitle = 'ЗАКРЫТЬ ПРОГРАММУ';
      strvoice("сохранить? данные в таблице?");
    break

    case 'сохранить таблицу':                     // СОХРАНИТЬ ТАБЛИЦУ НА ДИСКЕ
       dbsaveJob();
    break
	
    case 'добавить':                              // ВВОД НОВОГО ЗАДАНИЯ
      if (!modaltitle) {
        tdmiganie();
        editjob = 'новое';
        strcommand="";
  	    document.getElementById('dtins').classList.add("miganie");    // добавить МИГАНИЕ 
        voicecommand(strcommand);
      }
    break
	
    case 'изменить':                              // изменить существующее задание
      if (!modaltitle) {
        tdmiganie();
        strvoice("какое задание изменить?");
        editjob = 'изменить';
        modaltitle = 'ИЗМЕНИТЬ ЗАДАНИЕ';
        document.getElementById('dtedit').classList.add("miganie");    // добавить МИГАНИЕ 
      }
    break

    case 'копия':                                 // копировать существующее задание
      if (!modaltitle) {
        tdmiganie();
        strvoice("какое задание копировать?");
        editjob = 'копия';
        modaltitle = 'НОВОЕ ЗАДАНИЕ';
        document.getElementById('dtcopy').classList.add("miganie");    // добавить МИГАНИЕ 
      }
    break

    case 'удалить':                               // удалить существующее задание
      if (!modaltitle) {
  		  tdmiganie();
      	strvoice("какое задание удалить?");
      	editjob = 'удалить';
      	modaltitle = 'УДАЛИТЬ ЗАДАНИЕ';
  		  document.getElementById('dtdel').classList.add("miganie");    // добавить МИГАНИЕ 
      }
    break

    case 'задания на сегодня':
    case 'задание на сегодня':
      if (!modaltitle) {
        tdmiganie();

        editjob = 'поиск';

        document.getElementById('dtjobondate').classList.add("miganie");    // добавить МИГАНИЕ 
      }
    break

    case 'статус':                                // удалить существующее задание
      if (!modaltitle) {
      	strvoice("назовите задание");
      	editjob = 'статус';
        tdmiganie();
  		  document.getElementById('dtststus').classList.add("miganie");    // добавить МИГАНИЕ 
      }
    break

    case 'интернет':
    if (!modaltitle) {
        strvoice("Скажите, что искать");
        editjob = "okgoogle";
        tdmiganie();
        document.getElementById('dtenet').classList.add("miganie");    // добавить МИГАНИЕ 
      }
    break

    case 'закрыть интернет':
      windowmain.close();
      editjob = "";
      tdmiganie();
    break

    //----------------------------------------------------------------
    // ПОДТВЕРЖДЕНИЕ ПРИ ВЫХОДЕ ИЗ МОДАЛЬНОГО ОКНА 
    //----------------------------------------------------------------
    case 'сохранить':
    case 'да':
      switch (modaltitle) {
        case 'ЗАКРЫТЬ ПРОГРАММУ':
        
          dbsaveJob();
          errmodalopen = true;                              // не показывать закрытие модальных окон (не красиво смотриться)
          setTimeout( function(){ window.close()}, 3000);   // Задержка 3сек. для озвучки сообщения о записи на диск 
        break
        case "НОВОЕ ЗАДАНИЕ":
          if (today.value !== "" && job.value !== "") {
          	sortbydate("0", today.valueAsDate, hours.value+":"+minutes.value, job.value);
          } else {
            //----------------------------------------------------------------
            // НЕТ ДАТЫ ИЛИ ТЕКСТА ЗАДАНИЯ
            //----------------------------------------------------------------
            soundClick();									// включить смех
            document.getElementById('errmodaltext').innerHTML = "ОШИБКА - НЕТ ТЕКСТА ЗАДАНИЯ !!!"
            document.getElementById('errModal').className = 'errmodal';
            document.getElementById('errModal').style.display = "block";
            modaltitle = 'ВНИМАНИЕ !!!';
            errmodalopen = true;
            setTimeout(function(){ 
                          document.getElementById('errModal').className = 'errmodal-out';
                          modaltitle = 'НОВОЕ ЗАДАНИЕ';
                          job.focus(); errmodalopen = false;
                       }, 4500);
          }
        break
        case "ИЗМЕНИТЬ ЗАДАНИЕ":
          document.getElementById("myTable").deleteRow(nomerstroki);
          sortbydate("0", document.getElementById("today").valueAsDate, hours.value+":"+minutes.value, document.getElementById("job").value);	  
        break
        case "УДАЛИТЬ ЗАДАНИЕ":
          document.getElementById("myTable").deleteRow(nomerstroki);
          strvoice("удалили");
        break
      } // switch (modaltitle)

      if (!errmodalopen) {
        modal.className = 'modal-out';                  // поменять класс на <Закрытие модального окна>
        editjob = "";
        modaltitle = "";
        tdmiganie();
      }
    break

    //----------------------------------------------------------------
    // ОТКАЗ ПРИ ВЫХОДЕ ИЗ МОДАЛЬНОГО ОКНА 
    //----------------------------------------------------------------
    case 'закрыть':
    case 'выход':
    case 'нет':
      switch (modaltitle) {
        case 'ЗАКРЫТЬ ПРОГРАММУ':
          window.close();
        break
        case 'ПОИСК ПО ДАТЕ':
          modaldate.className = 'modal-out';
          modaltitle = ""; 
          tdmiganie();
        break
        case 'НОВОЕ ЗАДАНИЕ':
  	    case 'ИЗМЕНИТЬ ЗАДАНИЕ':
  	    case 'УДАЛИТЬ ЗАДАНИЕ':
  	      modal.className = 'modal-out';                  // поменять класс на <Закрытие модального окна>
  	      editjob = "";
          modaltitle = "";
          tdmiganie();
  	    break
        case 'ВНИМАНИЕ !!!':
  	      errmodalopen = false;
  	      document.getElementById('errModal').className = 'errmodal-out'; // закрыть окно с ошибками
  	      job.focus();                                    // установить фокус ввода в поле <НОВОЕ ЗАДАНИЕ>
  	      modaltitle = "";
          // modaltitle = 'НОВОЕ ЗАДАНИЕ';
  	    break
      }
    break

    //--------------------------------------------------------------------
    // АНАЛИЗ НЕ ОСНОВНЫХ КОМАНД (команды второго, третьего и ... уровней)
    //--------------------------------------------------------------------
    default:
      switch (editjob) {
        //----------------------------------------------------------------
  	    // ВВОД НОВОГО ЗАДАНИЯ
  	    //----------------------------------------------------------------
        case 'новое':
            editjob = "newjob";
            var dd = new Date();
            today.valueAsDate = dd;
            hours.value = checkTime(dd.getHours());
            minutes.value = checkTime(dd.getMinutes());
            modaltitle = 'НОВОЕ ЗАДАНИЕ';
            job.value = "";
            job.focus();
			      document.getElementById('recjob').classList.add("miganie");         // добавить МИГАНИЕ 
            modalblock (modal, modaltitle, 'СОХРАНИТЬ');
        break
        //----------------------------------------------------------------
        // ИЗМЕНИТЬ ИЛИ УДАЛИТЬ ВЫБРАННОЕ ЗАДАНИЕ
        //----------------------------------------------------------------
        case 'изменить':
        case 'удалить':
    	case 'статус':
        case 'копия':
          var onend = false;                                                    // если что то нашли, то = true
        	var trStroka = document.getElementById('myTable').getElementsByTagName('tr');  // получить массив всех строк
            for (nomerstroki=trStroka.length-1; nomerstroki>0; nomerstroki--) { // цикл по количеству строк в таблице
    	         var tdStroka = trStroka[nomerstroki].getElementsByTagName('td'); // получить массив всех колонок в строке
    	         var newjob = (tdStroka[3].innerHTML).toLowerCase();              // сделать все буквы маленькими
    	         if ( newjob.indexOf(strcommand) !== -1 ) {                       // нашли совпадение искомой строки
                  onend = true;                                                 // что-то нашли в таблице заданий
                  var str = tdStroka[1].innerHTML.split('.');                   // разделить на массив день-месяц-год
      	          today.value = str[2]+"-"+str[1]+"-"+str[0];			              // дата -> в поле "дата"
                  hours.value = tdStroka[2].innerHTML.substr(0,2);
                  minutes.value = tdStroka[2].innerHTML.substr(-2);
                	job.value = tdStroka[3].innerHTML;                            // задание -> в поле "задание"
					
                  switch (editjob) {
          			case 'изменить':
          				job.focus();
          				modalblock (modal, "ИЗМЕНИТЬ ЗАДАНИЕ", "СОХРАНИТЬ");
          				editjob = "newjob";
                  		document.getElementById('recjob').classList.add("miganie"); // добавить МИГАНИЕ 
                  	break
          			case 'копия':
          				job.focus();
          				modalblock (modal, "ИЗМЕНИТЬ ЗАДАНИЕ", "СОХРАНИТЬ");
          				editjob = "newjob";
          				document.getElementById('recjob').classList.add("miganie"); // добавить МИГАНИЕ 
          			break
                  	case 'удалить':
          				modalblock (modal, "УДАЛИТЬ ЗАДАНИЕ", "Да");
          				strvoice("Удалить?");
                  	break
	                  case 'статус':
	                    var checkstat = tdStroka[0].getElementsByTagName('input');
	                    var eqldates = twodates(tdStroka[1].innerHTML);             // сравнить даты
		                  if (eqldates >= 0) {                                        // сегодня дата больше или равно
	                        checkstat[0].checked = !(checkstat[0].checked);         // снять/поставить галочку
	                  			if (checkstat[0].checked)                               // если галочка стоит,
	                    			{ trStroka[nomerstroki].style.background="#ffffff"; } //    то: снять выделение строки
	                           else 			                                          // иначе: выделить строку "красным"
	                    			{ if(eqldates != 0) trStroka[nomerstroki].style.background="#ff6347";	}		 
	                    } else strvoice("Рано. Событие ещё не произошло!");
		                  document.getElementById('dtststus').classList.remove("miganie");
		                  editjob = "";
	                  	break
            		  } // switch (editjob)
          			break	// выход из for... нашли задание в таблице
				  }	// if ( newjob.indexOf(strcommand) !== -1 )
    	      }	// for (nomerstroki=1;
    	    if (!onend) strvoice("нет такого задания");
        	break
        case 'newjob':
          switch (strcommand) {
            case 'дата':
              strvoice("скажите новую дату");
              editjob='newdate';
              strcommand="";
      		  document.getElementById('recdate').classList.add("miganie");  // добавить МИГАНИЕ 
      		  document.getElementById('recjob').classList.remove("miganie");
            break

            case 'время':
              strvoice("скажите новое время");
              editjob='newtimes';
              strcommand="";
              document.getElementById('rechours').classList.add("miganie"); // добавить МИГАНИЕ 
              document.getElementById('recjob').classList.remove("miganie");
            break

            default:
              job.value = strcommand.trim().charAt(0).toUpperCase() + strcommand.trim().substr(1);  // Сделать 1-ю букву заглавной
          }
    		break
        //----------------------------------------------------------------
        // ВВОД НОВООЙ ДАТЫ
        //----------------------------------------------------------------
        case 'newdate':
          today.valueAsDate = formatDate(strcommand);
          editjob = "newjob";                                             // вернуться в окно редактирования задания
		      document.getElementById('recjob').classList.add("miganie");     // добавить МИГАНИЕ 
		      document.getElementById('recdate').classList.remove("miganie");
        break
        //----------------------------------------------------------------
        // ВВОД НОВОГО ВРЕМЕНИ
        //----------------------------------------------------------------
        case 'newtimes':
          strcommand=strcommand.replace(/[^0-9]/gim, '');                 // удалить все символы кроме цифр
          if (strcommand.length < 4) strcommand='0'+strcommand;           // если час сказан одной цифрой
          hours.value = strcommand.substr(0,2);
          minutes.value = strcommand.substr(-2);
          editjob = "newjob";                                             // вернуться в окно редактирования задания
          document.getElementById('recjob').classList.add("miganie");     // добавить МИГАНИЕ 
          document.getElementById('rechours').classList.remove("miganie");
        break
        //----------------------------------------------------------------
        // ОТКРЫТЬ НОВОЕ ОКНО В goodle со сказанной строкой
        //----------------------------------------------------------------
      	case 'okgoogle':
          var h = 1000, w = 1200;
          windowmain=window.open('https://www.google.ru/search?q='+strcommand, 'contacts', 'scrollbars=1,height='+Math.min(h, screen.availHeight)+',width='+Math.min(w, screen.availWidth)+',left='+Math.max(0, (screen.availWidth - w)/2)+',top='+Math.max(0, (screen.availHeight - h)/2));
          windowmain.focus();
      	break
      default :
      	strvoice("нет такой команды");
        modaltitle = "";
      	if ( ++errcommand > 2) {errcommand = 0; strvoice("и пожалуйста, будте повнимательней!");}
      	
      break
      } // switch (editjob)
    break // default:
  } // switch (strcommand)
} // function voicecommand(strcommand)

//----------------------------------------------------------------
// ПРЕОБРАЗОВАНИЕ СКАЗАННОЙ ДАТЫ В ФОРМАТ ДАТЫ
//----------------------------------------------------------------
function formatDate(strdate) {
  var nmonth;
  var month = ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
  var str = strdate.split(' ');             // разделить строку даты на массив день-месяц-год 
  var newdate = new Date(); 

  // завтра, послезавтра, через 3 дня, через 10 дней, через неделю, через 2 недели .......
  switch (str[0]) {
  	case 'сегодня': break
    case 'завтра':
    	newdate.setDate(newdate.getDate()+1); 
    break
    case 'послезавтра':
    case 'после завтра':
    	newdate.setDate(newdate.getDate()+2); 
    break
    case 'через':
      switch (str[2]) {
        case 'день':
        case 'дня':
        case 'дней':
          newdate.setDate(newdate.getDate()+Number(str[1]));
        break
      }
    break
    default :
      for ( nmonth =0; nmonth < 12; nmonth++) if ( month[nmonth] == str[1].substr(0,3)) break; // поиск по первым трем символам названия месяца
      var newdate = new Date();                 // установить новую СКАЗАННУЮ дату
      newdate.setMonth(nmonth);                 // месяц
      newdate.setDate(Number(str[0]));                  // день
      str.length <3 ? newdate.setFullYear(newdate.getFullYear()) : newdate.setFullYear(Number(str[2])); // полный год
      if (str[0] != newdate.getDate()) { strvoice("Ошибка в дате"); return(today.valueAsDate); }
  }
  return (newdate);                         // вернуть новую дату
}

//----------------------------------------------------------------
// ПОИСК ДАТЫ В МАССИВЕ СТРОК В ТАБЛИЦЕ ДЛЯ ВСТАВКИ НОВОЙ СТРОКИ
//----------------------------------------------------------------
function sortbydate(textCheck, textDate, textTimes, textZadaniya) {
  var trStroka = document.getElementById('myTable').getElementsByTagName('tr');   // получить массив всех строк
  for ( var nrow = trStroka.length-1; nrow>0; nrow--) {    	  // цикл по количеству строк в таблице (начиная с последней записи и до 1-й)
    var tdStroka = trStroka[nrow].getElementsByTagName('td');	// получить массив всех колонок в строке  
    if (twodates(tdStroka[1].innerHTML, textDate) >= 0) break;
  }
  addRowTable('myTable', nrow+1, textCheck, textDate.toLocaleDateString(), textTimes, textZadaniya);
}

//----------------------------------------------------------------
// СРАВНЕНИЕ ДАТЫ С ТЕКУЩЕЙ ДАТОЙ
//----------------------------------------------------------------
function twodates(date1,date2) {
  if (!date2) date2 = new Date();
  var str = date1.split('.');          	// разделить строку даты на массив день-месяц-год
  var intstr1 = str[2]+str[1]+str[0];	// дата -> в число yyyymmdd
  var intstr2 = String(date2.getFullYear())+checkTime(date2.getMonth()+1)+checkTime(date2.getDate());
  console.log('intstr2= '+intstr2+'   intstr1= '+intstr1)
  if (intstr2 > intstr1) return (1);	// сегодня больше сравниваемой даты
  if (intstr2 < intstr1) return (-1);	// сегодня меньше сравниваемой даты
  if (intstr2 == intstr1) return (0);	// сегодня равно сравниваемой дате
}

//----------------------------------------------------------------
// ВЫКЛЮЧИТЬ МИГАНИЕ УПРАВЛЯЮЩИХ КОМАНД
//----------------------------------------------------------------
function tdmiganie() {
  var idindex = ["recjob","dtins","dtedit","dtdel","dtenet","dtststus","dtcopy","dtjobondate"];
  for (var i=0; i < idindex.length; i++)
    document.getElementById(idindex[i]).classList.remove("miganie");  
}


//----------------------------------------------------------------
// ФОРМАТ ВЫВОДА ВРЕМЕНИ 00:00
//----------------------------------------------------------------
function checkTime(i){
if (i<10) i="0" + i; return i;
}

