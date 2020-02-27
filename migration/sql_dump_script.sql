-- Getting all applicants

SELECT
P.person_id,
P.name,
P.surname,
P.ssn,
P.email,
P.password,
P.username,
R.name AS role_name,
C.name AS competence_name,
CP.years_of_experience,
A.from_date AS avail_from,
A.to_date AS avail_to
FROM person AS P
JOIN role AS R ON P.role_id = R.role_id
JOIN availability AS A ON P.person_id = A.person_id
JOIN competence_profile AS CP ON P.person_id = CP.person_id
JOIN competence AS C ON CP.competence_id = C.competence_id
WHERE P.role_id = 2

-- Getting all recruiters

SELECT
P.person_id,
P.name,
P.surname,
P.ssn,
P.email,
P.password,
P.username,
R.name AS role_name
FROM person AS P
JOIN role AS R ON P.role_id = R.role_id
WHERE P.role_id = 1
