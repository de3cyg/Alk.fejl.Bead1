var express = require('express');

var router = express.Router();

//Viewmodel réteg

function isTeacher(role){
    return role=='teacher';
}

router.get('/list', function (req, res) {
    req.app.models.subject.find().then(function(subjects){
        //console.log(subjects);
        res.render('subjects/list', {
            subjects: subjects,
            isTeacher: isTeacher(req.user.role),
        });
        
    });
    
});


router.post('/list',function(req, res) {
    
    var subs = [];
    req.app.models.subject.find().then(function(subjects){
      for(var i=0; i<subjects.length; i++){
          if(req.body[subjects[i].subject_code]=='on'){
              subs.push(subjects[i].subject_code);
              
          }
      }
      
    req.app.models.subject_list.findOne({'userid': req.user.id}).then(function(s){
        console.log(s);
            subs=subs.concat(s.code);
            req.app.models.subject_list.destroy({'userid': req.user.id}).then(function(suc,err){
            //console.log('deleted: '+suc);
             });
             subs=arrayUnique(subs),
            req.app.models.subject_list.create({
                    code: subs,
                    userid: req.user.id
                })
                .then(function (subject) {
                    //siker
                    //req.flash('info', 'Tárgy sikeresen felvéve!');
                    res.redirect('/subjects/mysubjects');
                })
                .catch(function (err) {
                    //hiba
                    console.log(err);
                    res.redirect('/subjects/list');
            });
    });
    });
});


router.get('/mysubjects',function(req,res){
    var mySubs = [];
    if(isTeacher(req.user.role)){
        req.app.models.subject.find().then(function(subjects){
            for(var i = 0; i<subjects.length; i++){
                if(subjects[i].teacher == req.user.surname+' '+req.user.forename)
                {
                    //console.log(subjects[i]);
                    mySubs.push(subjects[i]);
                }
            } 
            res.render('subjects/list', {
                subjects: mySubs,
                isTeacher: isTeacher(req.user.role)
            });
        });
    } else {
        req.app.models.subject_list.findOne({'userid': req.user.id}).then(function(subjects){
          console.log(typeof subjects);
           req.app.models.subject.find().then(function(s){
               for(var j=0; j<s.length; j++){
                for(var i=0; i<subjects.code.length; i++)
                {
                    if(s[j].subject_code==subjects.code[i]){
                        mySubs.push(s[j]);
                    }    
                }
               }
                res.render('subjects/list', {
                     subjects: mySubs,
                     isTeacher: isTeacher(req.user.role)
                });  
           });
        });
          
    
    
}

});

router.get('/new', function (req, res) {
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    res.render('subjects/new', {
        validationErrors: validationErrors,
        data: data,
    });
});
router.post('/new', function (req, res) {
    // adatok ellenőrzése
    req.checkBody('subject_name', 'Hibás tárgynév').notEmpty().withMessage('Kötelező megadni!');

   
    req.checkBody('credit', 'Hibás kredit').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        // űrlap megjelenítése a hibákkal és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/subjects/new');
    }
    else {
        // adatok elmentése (ld. később) és a hibalista megjelenítése
        
        var code = 'IP-' +  req.body.subject_name[0] + req.body.subject_name[1] + '15';
        //var code = "IP-valami";
        //var teacherName = 'asd';
        var teacherName = req.user.surname+' '+req.user.forename;
        req.app.models.subject.create({
            subject_code: code,
            subject_name: req.body.subject_name,
            credit: parseInt(req.body.credit),
            teacher: teacherName
        })
        .then(function (subject) {
            //siker
            req.flash('info', 'Tárgy sikeresen hozzáadva!');
            res.redirect('/subjects/list');
        })
        .catch(function (err) {
            //hiba
            console.log(err);
        });
      
    }
});

module.exports = router;

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}