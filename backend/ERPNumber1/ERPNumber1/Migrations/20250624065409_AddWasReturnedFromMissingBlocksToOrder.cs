using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPNumber1.Migrations
{
    /// <inheritdoc />
    public partial class AddWasReturnedFromMissingBlocksToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "WasReturnedFromMissingBlocks",
                table: "Orders",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WasReturnedFromMissingBlocks",
                table: "Orders");
        }
    }
}
