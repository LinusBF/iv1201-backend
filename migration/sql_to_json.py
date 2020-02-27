import sys
import csv
import json

mode = 'applicant'
if len(sys.argv) > 1:
    mode = sys.argv[1]

filename = 'sql_dump' + ('_' + mode if mode is not 'applicant' else '') + '.csv'
with open(filename, mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    obj = {}
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            print(f'Column names are {", ".join(row)}')
            line_count += 1
        objKey = str(row['person_id'])
        if objKey not in obj:
            obj[objKey] = {} if mode is not 'applicant' else {'expertise': [], 'available': []}
        obj[objKey]['userId'] = row['person_id']
        obj[objKey]['firstName'] = row['name']
        obj[objKey]['lastName'] = row['surname']
        obj[objKey]['ssn'] = row['ssn']
        obj[objKey]['email'] = row['email']
        obj[objKey]['password'] = row['password']
        obj[objKey]['username'] = row['username']
        obj[objKey]['role_name'] = row['role_name']
        if mode is not 'applicant':
            continue
        if len(list(filter(lambda x: x['name'] == row['competence_name'], obj[objKey]['expertise']))) is 0:
            obj[objKey]['expertise'].append({'name': row['competence_name'], 'yearsExp': row['years_of_experience']})
        if len(list(filter(lambda x: x['from'] == row['avail_from'], obj[objKey]['available']))) is 0:
            obj[objKey]['available'].append({'from': row['avail_from'], 'to': row['avail_to']})

        line_count += 1
    print(f'Processed {line_count} lines.')
    filename = 'json_dump' + ('_' + mode if mode is not 'applicant' else '') + '.json'
    output = open(filename, "w")
    output.write(json.dumps(list(obj.values()), indent=2))
    output.close()
