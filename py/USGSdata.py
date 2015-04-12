import urllib2
import pandas as pd

import pdb

class USGSdata(object):
    '''
    A Class to interface to the USGS data bases via RESTlike interface. Data is output as a pandas data frame 
    '''
    
    def __init__(self):
        ''' 
        Build the initial object for interfacing
        '''
        self.restPath  = "http://waterservices.usgs.gov/nwis/site/?"
        
        # Build list of counties
        data = pd.read_csv('fips_codes_website.csv',header=0)
        countyIdx = data['Entity Description'] == 'County'
        countyData = data.ix[countyIdx]
        countyDataDF = countyData.drop('Entity Description',axis=1)
        # Re-index data from 0 after non-county drop
        idx = range(0,len(countyDataDF))
        countyDataDF.index = idx    
        
        # Build the state index
        stateCode = 'State FIPS Code'
        countyFIPS = 'County FIPS Code'
        # Recover the state codes from the first column
        states =  countyDataDF['State Abbreviation'].unique()
        stateCodes = countyDataDF['State FIPS Code'].unique()
        
        # Make a States dictionary
        self.stateCodes = {}
        for st, cd in zip(states, stateCodes):
            self.stateCodes[st] = cd
        
        # Generate the FIPS County Code for each County
        countyCodes = []
        for index, row in countyDataDF.iterrows():
            countyCodes.append("%02d%03d"%(self.stateCodes[row['State Abbreviation']],
                                                             row['County FIPS Code']))
        countryCodesDF = pd.DataFrame(countyCodes,columns=['USGS County Codes'])
        self.countyData = pd.concat([countyDataDF,countryCodesDF], join='inner', axis=1)
            
        
    def makeUSGSCountyCode(self, county):   
        ''' Generate the USGS county FIPS code including the State code based upon the county database'''
        # Get the State
        state = county['State Abbreviation']
        stateCode = self.stateCodes 
        return stateCode
        
    def getCountySites(self,countyIDs, format = 'rdb'):
        ''' Takes a county ID code a fetches information for the county's Sites.'''
        # Build the REST arguments
        # County
        countySTR = [str(cty) for cty in countyIDs]
        countryArg = "countyCd="+','.join(countySTR)
        # Format 
        if format:
            formatArg = "format="+format
        else:
            formatArg = "format=rdb"

        
        # REST Argument
        arg = "&".join([countryArg,formatArg])
        RESTrequest = self.restPath + arg
        print RESTrequest
        # contact services
        dataDF = pd.read_table(RESTrequest,
                            delimiter='\t',
                            comment  ='#')
        dataDF

    
    
    def getCountyData(countyID, codes = ''):
        ''' Get the Water Data for the specified county'''
        
        
           
    
if __name__ == '__main__':
    
    waterData = USGSdata()
    counties = [51059,51061]
    waterData.getCountySites(counties, format='')
