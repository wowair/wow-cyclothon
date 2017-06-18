#!/usr/bin/env python

#from geopy.distance import vincenty as distance
from geopy.distance import great_circle as distance
import json


def main():
    with open('cyclothonCoordinates.json', 'r') as fin:
        data = json.load(fin)

    prev_point = None
    for point in data['points']:
        point['ele'] = float(point['ele'])
        point['lat'] = float(point['lat'])
        point['lon'] = float(point['lon'])
        if not prev_point:
            point['dist'] = 0
            point['total_dist'] = 0
            prev_point = point
            continue

        dist = distance(
            (point['lat'], point['lon']),
            (prev_point['lat'], prev_point['lon'])
        ).meters
        point['dist'] = dist
        point['total_dist'] = dist + prev_point['total_dist']
        prev_point = point

    print point['total_dist']

    elevation = map(lambda x: float(x['ele']), data['points'])

    data['distance'] = point['total_dist']
    data['elevation_max'] = max(elevation)
    data['elevation_min'] = min(elevation)

    # Normalize data
    # 1. shift distance to range [0, total_distance]
    # 2. add normalized dist as ndist and ndist_total [0, 1]
    # 3. add noramlized ele as nele [0, 1]
    distance_total = data['distance']
    elevation_shift = -data['elevation_min']
    data['elevation_min'] = 0
    data['elevation_max'] = data['elevation_max'] + elevation_shift
    elevation_max = data['elevation_max']
    for point in data['points']:
        # shift and normalize elevation data
        point['ele'] = point['ele'] + elevation_shift
        point['nele'] = point['ele'] / elevation_max

        # normalize distance data
        point['ndist'] = point['dist'] / distance_total
        point['total_ndist'] = point['total_dist'] / distance_total

    print "Stats:"
    print " Distance: {}".format(data['distance'])
    print " Max Elevation: {}".format(data['elevation_max']
    print " Min Elevation: {}".format(data['elevation_min']


    with open('data.json', 'w') as fout:
        json.dump(data, fout)


if __name__ == "__main__":
    main()
