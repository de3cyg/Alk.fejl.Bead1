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
        });
    } else {
        //ide jön a diák tárgyainak kilistázása...
        req.app.models.subject.find().then(function(subjects){
           req.app.models.subject_list.find(req.user).then(function(list){
                for(var i=0; i<subjects.length; i++){
                    for(var j=0; j<list.code.length; j++){
                        if(subjects[i].subject_code == list.code[i]){
                            mySubs.push(subjects[i]);
                        }
                    }
                }  
           });
        });
    }
    
    res.render('subjects/list', {
        subjects: mySubs,
        isTeacher: isTeacher(req.user.role)
    });
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
   
    //req.sanitizeBody('credit').escape();
   
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
            req.flash('info', 'Tárgy sikeresen felvéve!');
            res.redirect('/subjects/list');
        })
        .catch(function (err) {
            //hiba
            console.log(err);
        });
      
    }
});

module.exports = router;