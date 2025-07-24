import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

args = getResolvedOptions(sys.argv, ['JOB_NAME'])

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Example: Read from a source S3 bucket (replace with your bucket/path)
dyf = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={"paths": ["s3://your-source-bucket/path/"]},
    format="csv",
    format_options={"withHeader": True}
)

# Example transformation: just pass through (no-op)
transformed_dyf = dyf

# Example: Write to a target S3 bucket (replace with your bucket/path)
glueContext.write_dynamic_frame.from_options(
    frame=transformed_dyf,
    connection_type="s3",
    connection_options={"path": "s3://your-target-bucket/output/"},
    format="parquet"
)

job.commit() 